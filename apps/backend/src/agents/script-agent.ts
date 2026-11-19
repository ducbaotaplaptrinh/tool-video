import { ResearchDossier, ScriptDocument, ScriptDocumentSchema } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';

export class ScriptAgent {
  async execute(
    dossier: ResearchDossier, 
    options?: { targetDurationSec?: number },
    providerMode?: 'live' | 'mock'
  ): Promise<ScriptDocument> {
    const registry = ProviderRegistry.getInstance();
    const llm = registry.getLLM(providerMode || (dossier.isMockEngine ? 'mock' : 'live'));

    const rawScript = await llm.generateScript(dossier, options);

    // Validate with Zod Schema
    const validated = ScriptDocumentSchema.parse(rawScript);
    return validated;
  }
}
