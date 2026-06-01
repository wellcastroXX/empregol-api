import { ExploreRepository } from './explore.repository';
import { ExploreQueryDTO } from './explore.dto';

export class ExploreService {
  private readonly repo = new ExploreRepository();

  async search(userId: string, dto: ExploreQueryDTO) {
    const contractor = await this.repo.findContractorByUserId(userId);
    return this.repo.search(dto, contractor?.id);
  }
}
