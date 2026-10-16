import type { JobAnalysisOutput } from "@/lib/ai/schema";
import type { JobListing } from "@/lib/types/job";
import type { CandidateProfile } from "@/lib/types/profile";

export type AnalysisRequest = {
  profile: CandidateProfile;
  job: JobListing;
};

export type AnalysisProviderResult = {
  analysis: JobAnalysisOutput;
  provider: string;
  model: string;
};

export type AnalysisProvider = {
  readonly name: string;
  analyze(request: AnalysisRequest): Promise<AnalysisProviderResult>;
};
