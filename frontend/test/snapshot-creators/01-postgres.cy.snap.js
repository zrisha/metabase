import {
  restore,
  generateSnapshot,
  addPostgresDatabase,
} from "__support__/cypress";
import { PG_DB_NAME } from "__support__/cypress_data";

describe("qa databases > postgres snapshot", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
  });

  it("postgres", () => {
    addPostgresDatabase(PG_DB_NAME);
    generateSnapshot("postgres");
  });
});
