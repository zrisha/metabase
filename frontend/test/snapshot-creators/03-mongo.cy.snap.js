import {
  restore,
  generateSnapshot,
  addMongoDatabase,
} from "__support__/cypress";
import { MONGO_DB_NAME } from "__support__/cypress_data";

describe("qa databases > mongo snapshot", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
  });

  it("mongo", () => {
    addMongoDatabase(MONGO_DB_NAME);
    generateSnapshot("mongo");
  });
});
