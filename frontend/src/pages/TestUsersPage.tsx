import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import axios from "axios";

export function TestUsersPage() {
  const { user } = useAuth();
  const [result, setResult] = useState("");

  const testGetUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/users/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setResult(err.response?.data?.detail || "Error");
    }
  };

  const testGetMe = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/v1/users/" + user?.id, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      setResult(JSON.stringify(response.data, null, 2));
    } catch (err: any) {
      setResult(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Users Endpoints</h1>
      <div className="flex gap-2 mb-4">
        <Button onClick={testGetUsers}>GET /users</Button>
        <Button onClick={testGetMe}>GET /users/{user?.id}</Button>
      </div>
      <pre className="bg-gray-100 p-4 rounded">{result}</pre>
    </div>
  );
}