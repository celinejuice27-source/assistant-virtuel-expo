import {
  AirplaneTakeoff,
  Bed,
  Briefcase,
  ChatsCircle,
  Coffee,
  FirstAid,
  ForkKnife,
  type Icon,
} from '@/components/icons';

export type SceneId = 'libre' | 'cafe' | 'aeroport' | 'hotel' | 'resto' | 'medecin' | 'entretien';

export type Scene = {
  id: SceneId;
  title: string;
  role: string;
  level: string;
  minutes: number;
  icon: Icon;
};

export const SCENES: Scene[] = [
  { id: 'libre', title: 'Conversation libre', role: 'Parlez de tout et de rien', level: 'Tous', minutes: 10, icon: ChatsCircle },
  { id: 'cafe', title: 'Commander au café', role: "L'agent est serveur", level: 'A1', minutes: 5, icon: Coffee },
  { id: 'aeroport', title: "À l'aéroport", role: 'Enregistrement et contrôle', level: 'A2', minutes: 8, icon: AirplaneTakeoff },
  { id: 'hotel', title: "Check-in à l'hôtel", role: 'Réception, réclamation', level: 'A2', minutes: 6, icon: Bed },
  { id: 'resto', title: 'Au restaurant', role: 'Réserver, commander, payer', level: 'B1', minutes: 8, icon: ForkKnife },
  { id: 'medecin', title: 'Chez le médecin', role: 'Décrire des symptômes', level: 'B1', minutes: 7, icon: FirstAid },
  { id: 'entretien', title: "Entretien d'embauche", role: "L'agent est recruteur", level: 'B2', minutes: 12, icon: Briefcase },
];

export function getScene(id: string | undefined): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
