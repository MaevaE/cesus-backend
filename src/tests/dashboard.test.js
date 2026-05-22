import request from "supertest";
import app from "../app.js";

describe("Dashboard API", () => {

  test("GET /api/dashboard/stats", async () => {

    const response = await request(app)
      .get("/api/dashboard/stats");

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("population");
    expect(response.body).toHaveProperty("households");
    expect(response.body).toHaveProperty("agents");

  });

});