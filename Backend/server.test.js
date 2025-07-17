const request = require("supertest");
const { app, server } = require("./server");

describe("API Routes", () => {
  afterAll((done) => {
    server.close(done);
  });

  describe("GET /status", () => {
    it("should return drone state", async () => {
      const response = await request(app).get("/status");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("battery");
      expect(response.body).toHaveProperty("latitude");
      expect(response.body).toHaveProperty("longitude");
      expect(response.body).toHaveProperty("altitude");
      expect(response.body).toHaveProperty("status");
    });
  });

  describe("POST /start-mission", () => {
    it("should start a new mission", async () => {
      const response = await request(app).post("/start-mission");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Mission started");
      expect(response.body).toHaveProperty("status", "in_mission");
    });
  });
});
