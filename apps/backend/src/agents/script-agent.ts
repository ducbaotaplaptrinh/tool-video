import { ResearchDossier, ScriptDocument, ScriptDocumentSchema } from '@vietsu/shared';
import { ProviderRegistry } from '@vietsu/ai-providers';

export class ScriptAgent {
  async execute(dossier: ResearchDossier): Promise<ScriptDocument> {
    const registry = ProviderRegistry.getInstance();
    const llm = registry.getLLM();

    const rawScript = await llm.generateScript(dossier);

    // Validate with Zod Schema
    const validated = ScriptDocumentSchema.parse(rawScript);
    return validated;
  }
}
