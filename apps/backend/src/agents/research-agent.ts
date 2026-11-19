import { ResearchDossier, ResearchDossierSchema } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';

export class ResearchAgent {
  async execute(topic: string, historicalEra: string): Promise<ResearchDossier> {
    const registry = ProviderRegistry.getInstance();
    const llm = registry.getLLM();

    const rawDossier = await llm.researchHistory(topic, historicalEra);

    // Validate with Zod Schema
    const validated = ResearchDossierSchema.parse(rawDossier);
    return validated;
  }
}
