"use client"
/**
 * Landing / login entry page for DeltaBase (links into the dashboard).
 */
import styles from "@/components/page/page.module.css";
import { useRouter } from "next/navigation";

/** Landing page with brand intro and CTA into `/dashboard`. */
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
