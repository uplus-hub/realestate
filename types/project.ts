export type SpaceType = 
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'balcony'
  | 'entrance'
  | 'other';

export type AreaUnit = '평' | '㎡';

export type ProjectStatus = 
  | 'pending'
  | 'quoted'
  | 'contracted'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface RentalChecklist {
  noiseRestriction: boolean;
  drillingRestriction: boolean;
  wallModification: boolean;
  floorModification: boolean;
  otherRestrictions?: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  space_types: SpaceType[];
  area: {
    value: number;
    unit: AreaUnit;
  };
  budget: number;
  is_rental: boolean;
  rental_checklist?: RentalChecklist | null;
  status: ProjectStatus;
  sla_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFormData {
  title: string;
  spaceTypes: SpaceType[];
  area: {
    value: number;
    unit: AreaUnit;
  };
  budget: number;
  isRental: boolean;
  rentalChecklist?: RentalChecklist;
  photos: string[]; // Supabase Storage URLs
}

