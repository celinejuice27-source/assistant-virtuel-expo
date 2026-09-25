import { Redirect } from 'expo-router';

/** Chemin inconnu (lien profond obsolète, version web hébergée sous un sous-chemin) : retour à l'entrée de l'app. */
export default function NotFound() {
  return <Redirect href="/" />;
}
