import {
  restore,
  snapshot,
  addPostgresDatabase,
  addMongoDatabase,
  addMySQLDatabase,
} from "__support__/cypress";
import {
  PG_DB_NAME,
  MONGO_DB_NAME,
  MYSQL_DB_NAME,
} from "__support__/cypress_data";

describe("qa databases", () => {
  beforeEach(() => {
    restore();
    cy.signInAsAdmin();
  });

  it("postgres", () => {
    addPostgresDatabase(PG_DB_NAME);
    generateSnapshot("postgres");
  });

  it("mysql", () => {
    addMySQLDatabase(MYSQL_DB_NAME);
    generateSnapshot("mysql");
  });

  it("mongo", () => {
    addMongoDatabase(MONGO_DB_NAME);
    generateSnapshot("mongo");
  });
});

function generateSnapshot(engine) {
  cy.request("GET", "/api/database").then(({ body }) => {
    const { id } = body.find(db => {
      return db.engine === engine;
    });
    cy.request("POST", `/api/database/${id}/sync_schema`);
    cy.request("POST", `/api/database/${id}/rescan_values`);

    cy.wait(1000);
    cy.request("GET", `/api/database/${id}/metadata`).then(({ body }) => {
      cy.wrap(body.tables).should("have.length", 4);
    });
    snapshot(engine);
    cy.request("DELETE", `/api/database/${id}`);
  });
  restore("default");
}
