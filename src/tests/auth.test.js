import request from "supertest";
import app from "../app.js";

describe("Auth API", () => {

  test("POST /api/auth/register", async () => {

    const randomEmail =
      `maeva${Date.now()}@test.com`;

    const response = await request(app)
      .post("/api/auth/register")
      .send({
        full_name: "Maeva Ewolo",
        email: randomEmail,
        password: "123456",
      });

    console.log(response.body);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("email");

    expect(response.body.email).toBe(randomEmail);

  });

});