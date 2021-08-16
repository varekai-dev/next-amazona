import { useRouter } from "next/dist/client/router";
import React from "react";
import { Store } from "../utils/Store";

export default function Shipping() {
  const router = useRouter();
  const { state } = React.useContext(Store);
  const { userInfo } = state;
  React.useEffect(() => {
    if (!userInfo) {
      router.push("/login?redirect=/shipping");
    }
  }, []);

  router.push("/login");
  return <div></div>;
}
