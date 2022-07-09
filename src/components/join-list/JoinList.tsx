import { useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Flex, Button, Text } from "@chakra-ui/react";
import firebase from "firebase/compat/app";
import "firebase/compat/functions";

interface JoinListParams {
  code?: string;
  id?: string;
}

type JoinListFunction = (
  params: JoinListParams
) => Promise<firebase.functions.HttpsCallableResult>;

const joinListFunction: JoinListFunction = firebase
  .app()
  .functions("europe-west1")
  .httpsCallable("joinList");

function JoinList() {
  const location = useLocation();
  const history = useHistory();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get("id");
  const code = searchParams.get("code");
  const [loading, setLoading] = useState(false);

  async function join() {
    if (!code || !id) {
      history.replace("/");
      return;
    }

    try {
      setLoading(true);
      await joinListFunction({ code, id });
      history.replace(`/list/${id}`);
    } catch (e) {
      alert(`The list doesn't exist`);
      history.replace("/");
    }

    setLoading(false);
  }

  return (
    <Flex
      height="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Text as="h1" fontSize="2xl" fontWeight={600} mb={4}>
        You've been invited to this list
      </Text>

      <Button
        colorScheme="blue"
        onClick={join}
        width="100%"
        isLoading={loading}
        isDisabled={loading}
      >
        Join
      </Button>
    </Flex>
  );
}

export default JoinList;
