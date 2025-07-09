const bcrypt = require("bcrypt");

const testPassword = "mypassword123";

bcrypt.hash(testPassword, 10, (err, hash) => {
  if (err) {
    console.error("❌ Error hashing password:", err);
  } else {
    console.log("✅ Hashed password:", hash);

    // Test matching
    bcrypt.compare(testPassword, hash, (err, result) => {
      if (err) {
        console.error("❌ Error comparing:", err);
      } else {
        console.log("✅ Do they match?", result);
      }
    });
  }
});
