import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Activity } from 'lucide-react';
import { PatientInfo } from '@/types/medical';

interface PatientCardProps {
  patient: PatientInfo;
}

export const PatientCard = ({ patient }: PatientCardProps) => {
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card className="shadow-medical">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <User className="h-5 w-5 text-primary" />
          Patient Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{patient.name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Age: {calculateAge(patient.dateOfBirth)} years
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {patient.gender}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4 text-accent" />
              <span className="font-medium">Last Test:</span>
              {new Date(patient.lastTestDate).toLocaleDateString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Patient ID: {patient.id}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};