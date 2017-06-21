import { Pongo } from "../../pongo/callback_api";
import { helper } from "./helper";

Pongo.getConnection('mongodb://localhost:27017/admin', { poolSize: 3 }, (err, db) => {
  if (err == null) {
    helper()
  }
})
