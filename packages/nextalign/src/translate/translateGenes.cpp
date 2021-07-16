#include "translateGenes.h"

#include <fmt/format.h>
#include <nextalign/nextalign.h>

#include <gsl/string_span>
#include <string>
#include <string_view>

#include "../alphabet/aminoacids.h"
#include "../alphabet/nucleotides.h"
#include "../strip/stripInsertions.h"
#include "./extractGene.h"
#include "./mapCoordinates.h"
#include "./translate.h"
#include "align/alignPairwise.h"
#include "utils/contains.h"
#include "utils/contract.h"


PeptidesInternal translateGenes(         //
  const NucleotideSequence& query,       //
  const NucleotideSequence& ref,         //
  const GeneMap& geneMap,                //
  const std::vector<int>& gapOpenCloseAA,//
  const NextalignOptions& options        //
) {

  NucleotideSequence newQueryMemory(ref.size(), Nucleotide::GAP);
  NucleotideSequenceSpan newQuery{newQueryMemory};

  NucleotideSequence newRefMemory(ref.size(), Nucleotide::GAP);
  NucleotideSequenceSpan newRef{newRefMemory};

  const auto coordMap = mapCoordinates(ref);

  std::vector<PeptideInternal> queryPeptides;
  queryPeptides.reserve(geneMap.size());

  std::vector<PeptideInternal> refPeptides;
  refPeptides.reserve(geneMap.size());

  Warnings warnings;
  std::vector<FrameShift> frameShifts;

  // For each gene in the requested subset
  for (const auto& [geneName, _] : geneMap) {
    const auto& found = geneMap.find(geneName);
    if (found == geneMap.end()) {
      const auto message = fmt::format(
        "When processing gene \"{:s}\": "
        "Gene \"{}\" was not found in the gene map. "
        "Note that this gene will not be included in the results "
        "of the sequence.",
        geneName, geneName);
      warnings.inGenes.push_back(GeneWarning{.geneName = geneName, .message = message});
      continue;
    }

    const auto& gene = found->second;

    // TODO: can be done once during initialization
    const auto& extractRefGeneStatus = extractGeneQuery(ref, gene, coordMap);
    if (extractRefGeneStatus.status != Status::Success) {
      const auto message = *extractRefGeneStatus.error;
      warnings.inGenes.push_back(GeneWarning{.geneName = geneName, .message = message});
      continue;
    }


    const auto& extractQueryGeneStatus = extractGeneQuery(query, gene, coordMap);
    if (extractQueryGeneStatus.status != Status::Success) {
      const auto message = *extractQueryGeneStatus.error;
      warnings.inGenes.push_back(GeneWarning{.geneName = geneName, .message = message});

      if (extractQueryGeneStatus.reason == ExtractGeneStatusReason::GeneLengthNonMul3) {
        frameShifts.emplace_back(FrameShift{.geneName = geneName});
      }

      continue;
    }

    auto refPeptide = translate(*extractRefGeneStatus.result);
    auto queryPeptide = translate(*extractQueryGeneStatus.result);
    const int queryLength = extractQueryGeneStatus.result->size();
    const int expectedPeptideLength = queryLength / 3;
    const int peptideLength = queryPeptide.size();

    // I wanted to check for a truncated peptide here, but translate
    // returns a gap-padded (now X-padded) full length peptide
    // if (expectedPeptideLength>peptideLength){
    //   queryPeptide.resize(expectedPeptideLength);
      // for (int j_aa = queryPeptide.size()+1; j_aa < expectedPeptideLength; ++j_aa) {
      //     queryPeptide[j_aa] = Aminoacid::X;
      // }
    // this is a hack, as it will also trigger in cases where the nucleotide sequence is `NNN`
    // if (queryPeptide[queryPeptide.size()-1]==Aminoacid::X){
    //   const auto message = fmt::format("When processing gene \"{:s}\": permature STOP codon.", geneName);
    //   warnings.inGenes.push_back(GeneWarning{.geneName = geneName, .message = message});
    // }

    const auto geneAlignmentStatus =
      alignPairwise(queryPeptide, refPeptide, gapOpenCloseAA, options.alignment, options.seedAa);

    if (geneAlignmentStatus.status != Status::Success) {
      const auto message = fmt::format(
        "When processing gene \"{:s}\": {:>16s}. "
        "Note that this gene will not be included in the results "
        "of the sequence.",
        geneName, *geneAlignmentStatus.error);
      warnings.inGenes.push_back(GeneWarning{.geneName = geneName, .message = message});
      continue;
    }

    auto stripped = stripInsertions(geneAlignmentStatus.result->ref, geneAlignmentStatus.result->query);

    queryPeptides.emplace_back(PeptideInternal{
      .name = geneName,                           //
      .seq = std::move(stripped.queryStripped),   //
      .insertions = std::move(stripped.insertions)//
    });

    refPeptides.emplace_back(PeptideInternal{
      .name = geneName,            //
      .seq = std::move(refPeptide),//
      .insertions = {}             //
    });
  }

  return PeptidesInternal{
    .queryPeptides = queryPeptides,//
    .refPeptides = refPeptides,    //
    .warnings = warnings,          //
    .frameShifts = frameShifts,    //
  };
}
