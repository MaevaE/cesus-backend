import request from "supertest";
import app from "../app.js";

describe("Households API", () => {

  test("POST /api/households", async () => {

    const response = await request(app)
      .post("/api/households")
      .send({
        zone_id: 1,
        household_head: "Famille Ngo",
        address: "Douala",
        latitude: 4.05,
        longitude: 9.70,
        members_count: 5
      });

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("household_head");

  });

});