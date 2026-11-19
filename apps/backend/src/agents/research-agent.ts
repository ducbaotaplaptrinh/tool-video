import { ResearchDossier, ResearchDossierSchema } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';

export class ResearchAgent {
  async execute(topic: string, historicalEra: string, providerMode?: 'live' | 'mock'): Promise<ResearchDossier> {
    const registry = ProviderRegistry.getInstance();
    const llm = registry.getLLM(providerMode || 'mock');

    const rawDossier = await llm.researchHistory(topic, historicalEra);

    // Validate with Zod Schema
    const validated = ResearchDossierSchema.parse(rawDossier);
    return validated;
  }
}
