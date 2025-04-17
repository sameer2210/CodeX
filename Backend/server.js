import app from "./src/app.js";
import connectToDb from "./src/db/db.js";

connectToDb();

const port = process.env.PORT || 5000;

app.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
