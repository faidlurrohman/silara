import { useAppSelector } from "./useRedux";

export default function useRole() {
  const user = useAppSelector((state) => state.session.user);
  return parseInt(user?.token.substr(user?.token.length - 1));
}
