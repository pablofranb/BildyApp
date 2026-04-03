import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    mensaje: "API de BildyApp",
    endpoints: {
      api: "/api",
      health: "/health"
    }
  });
});

export default router;