

import app from "./src/app.js";

const port = process.env.PORT;

app.listen(port, (req, res) => {
  console.log(`server is running on port ${port}`);
});
