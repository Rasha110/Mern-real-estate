export default function handler(req, res) {
  if (req.url === "/api/test") {
    res.status(200).json({ message: "API test route works ✅" });
  } else {
    res.status(200).send("Backend root is running 🚀");
  }
}
