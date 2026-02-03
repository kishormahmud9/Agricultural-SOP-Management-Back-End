import bcrypt from "bcrypt";

const run = async () => {
    const password = "11";
    const hash = await bcrypt.hash(password, 10);

    console.log("Password:", password);
    console.log("Hash:", hash);

    process.exit(0);
};

run();
