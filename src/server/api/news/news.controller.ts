import { Controller, Get, Inject } from "@nestjs/common";
import { NewsService } from "./news.service";

@Controller("api/news")
export class NewsController {
  constructor(@Inject(NewsService) private readonly newsService: NewsService) {}

  @Get("articles")
  getArticles() {
    return this.newsService.getArticles();
  }

  @Get("advisories")
  getAdvisories() {
    return this.newsService.getAdvisories();
  }

  @Get("disaster-preparedness")
  getDisasterPreparedness() {
    return this.newsService.getDisasterPreparedness();
  }

  @Get("updates")
  getUpdates() {
    return this.newsService.getUpdates();
  }

  @Get("gallery")
  getGallery() {
    return this.newsService.getGallery();
  }

  @Get("community")
  getCommunity() {
    return this.newsService.getCommunity();
  }

  @Get("public-notices")
  getPublicNotices() {
    return this.newsService.getPublicNotices();
  }

  @Get("downloadable")
  getDownloadable() {
    return this.newsService.getDownloadableForms();
  }
}
