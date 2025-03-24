"use client";

import { useEffect, useState } from "react";

const LoginModal = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // Ensure localStorage access only on the client
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    }
  }, []);

  interface LoginFormEvent extends React.FormEvent<HTMLFormElement> {}

  const handleLogin = async (e: LoginFormEvent): Promise<void> => {
    e.preventDefault();
    if (email === "" || password === "") {
      alert("Please fill all the fields");
      return;
    }

    if (
      email === process.env.NEXT_PUBLIC_EMAIL &&
      password === process.env.NEXT_PUBLIC_PASSWORD
    ) {
      alert("Login Successful");
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true); // Update state immediately
      setEmail("");
      setPassword("");
      return;
    }
  };

  return (
    <>
      {isLoggedIn === false && (
        <div className="fixed top-0 left-0 right-0 bg-white z-50 h-screen flex justify-center items-center">
          <form
            onSubmit={handleLogin}
            className="bg-white sm:w-96 w-full mx-5 p-5 rounded-lg shadow-lg flex flex-col space-y-4"
          >
            <h2 className="text-2xl font-semibold text-center">Login</h2>
            <div className="flex flex-col space-y-1 w-full">
              <label htmlFor="email">Email :</label>
              <input
                className=" w-full outline-none border-2 border-gray-500 bg-transparent rounded-md p-2"
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div className="flex flex-col space-y-1 w-full">
              <label htmlFor="password">Password :</label>
              <input
                className="w-full outline-none border-2 border-gray-500 bg-transparent rounded-md p-2"
                type="password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
            <div>
              <button className="bg-blue-600 py-3 text-white w-full text-center rounded-md">
                Login
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default LoginModal;
