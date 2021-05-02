import {
  restore,
  generateSnapshot,
  addMySQLDatabase,
} from "__support__/cypress";
import { MYSQL_DB_NAME } from "__support__/cypress_data";

describe("qa databases > mysql snapshot", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
  });

  it("mysql", () => {
    addMySQLDatabase(MYSQL_DB_NAME);
    generateSnapshot("mysql");
  });
});
