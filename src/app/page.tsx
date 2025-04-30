"use client"
import styles from "@/ui/page/page.module.css";
import { useRouter } from "next/navigation";

const LoginPage = () => {

  const router = useRouter();
  const handleSumbit = async(event: React.FormEvent<HTMLFormElement>) =>{
    event.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={ handleSumbit }>
        <h1>Login</h1>
        <input type="text" placeholder="username" name="username" />
        <input type="password" placeholder="password" name="password" />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
