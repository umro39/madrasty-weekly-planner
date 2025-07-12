import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, BookOpen } from "lucide-react";
import SubjectCard from "./SubjectCard";
import { useToast } from "@/hooks/use-toast";

// بيانات المواد الدراسية
const subjects = [
  { name: "الدراسات الإسلامية", color: "islamic", icon: "🕌" },
  { name: "اللغة العربية", color: "arabic", icon: "📚" },
  { name: "الاجتماعيات", color: "social", icon: "🌍" },
  { name: "العلوم", color: "science", icon: "🔬" },
  { name: "الرياضيات", color: "math", icon: "📊" },
  { name: "التربية الفنية", color: "art", icon: "🎨" },
  { name: "التربية البدنية", color: "physical", icon: "⚽" },
  { name: "التربية الأسرية", color: "family", icon: "🏠" },
  { name: "المهارات الرقمية", color: "digital", icon: "💻" },
  { name: "التفكير الناقد", color: "critical", icon: "🧠" },
  { name: "اللغة الإنجليزية", color: "english", icon: "🇬🇧" }
];

const grades = ["الأول متوسط", "الثاني متوسط", "الثالث متوسط"];

interface WeeklyPlan {
  subject: string;
  grade: string;
  fileName: string;
  fileType: 'image' | 'pdf';
  uploadDate: string;
  url: string;
  week: number; // إضافة رقم الأسبوع
}

const WeeklyPlansBoard = () => {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState(1);
  const [allWeeklyPlans, setAllWeeklyPlans] = useState<WeeklyPlan[]>([]);
  
  const totalWeeks = 15; // إجمالي عدد الأسابيع

  const getCurrentWeekDates = (weekNumber: number) => {
    // حساب التواريخ بناءً على رقم الأسبوع (افتراض بداية العام الدراسي)
    const schoolYearStart = new Date('2024-09-01'); // تاريخ بداية العام الدراسي
    const startOfWeek = new Date(schoolYearStart);
    startOfWeek.setDate(schoolYearStart.getDate() + (weekNumber - 1) * 7);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString('ar-SA'),
      end: endOfWeek.toLocaleDateString('ar-SA')
    };
  };

  // التنقل بين الأسابيع
  const goToPreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const goToNextWeek = () => {
    if (currentWeek < totalWeeks) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const handleFileUpload = (file: File, subject: string, grade: string) => {
    const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
    const uploadDate = new Date().toLocaleDateString('ar-SA');
    
    // محاكاة رفع الملف - في التطبيق الحقيقي سيتم رفعه للخادم
    const newPlan: WeeklyPlan = {
      subject,
      grade,
      fileName: file.name,
      fileType,
      uploadDate,
      url: URL.createObjectURL(file),
      week: currentWeek // ربط الخطة بالأسبوع الحالي
    };

    setAllWeeklyPlans(prev => {
      const filtered = prev.filter(plan => 
        !(plan.subject === subject && plan.grade === grade && plan.week === currentWeek)
      );
      return [...filtered, newPlan];
    });

    toast({
      title: "تم رفع الخطة بنجاح! ✅",
      description: `تم رفع خطة ${subject} - ${grade} للأسبوع ${currentWeek}`,
    });
  };

  const getWeeklyPlan = (subject: string, grade: string) => {
    return allWeeklyPlans.find(plan => 
      plan.subject === subject && plan.grade === grade && plan.week === currentWeek
    );
  };

  // حساب الخطط للأسبوع الحالي فقط
  const currentWeekPlans = allWeeklyPlans.filter(plan => plan.week === currentWeek);

  const weekDates = getCurrentWeekDates(currentWeek);
  const uploadedPlansCount = currentWeekPlans.length;
  const totalPlansNeeded = subjects.length * grades.length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-gradient-header text-white shadow-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="w-8 h-8" />
              <CardTitle className="text-2xl md:text-3xl font-bold">
                لوحة الخطط الأسبوعية - المرحلة المتوسطة
              </CardTitle>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              <span>الأسبوع {currentWeek} من {totalWeeks}: {weekDates.start} - {weekDates.end}</span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Statistics */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{uploadedPlansCount}</div>
              <div className="text-sm text-muted-foreground">خطط تم رفعها</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-muted-foreground">{totalPlansNeeded}</div>
              <div className="text-sm text-muted-foreground">إجمالي الخطط المطلوبة</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-accent">
                {Math.round((uploadedPlansCount / totalPlansNeeded) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">نسبة الإنجاز</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {grades.map((grade) => (
          <div key={grade} className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="outline" className="text-lg px-4 py-2 font-bold bg-primary/10 text-primary border-primary/20">
                {grade}
              </Badge>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subjects
                .filter(subject => {
                  // إزالة التفكير الناقد من الأول والثاني متوسط فقط
                  if (subject.name === "التفكير الناقد" && 
                      (grade === "الأول متوسط" || grade === "الثاني متوسط")) {
                    return false;
                  }
                  return true;
                })
                .map((subject) => (
                  <SubjectCard
                    key={`${subject.name}-${grade}`}
                    subject={subject.name}
                    grade={grade}
                    color={subject.color}
                    onUpload={(file) => handleFileUpload(file, subject.name, grade)}
                    weeklyPlan={getWeeklyPlan(subject.name, grade)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Week Navigation */}
      <div className="max-w-7xl mx-auto mt-8">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToPreviousWeek}
              disabled={currentWeek === 1}
            >
              <ChevronRight className="w-4 h-4 ml-2" />
              الأسبوع السابق
            </Button>
            <span className="text-sm font-medium">الأسبوع {currentWeek} من {totalWeeks}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={goToNextWeek}
              disabled={currentWeek === totalWeeks}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              الأسبوع التالي
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 pb-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            " مصمم لوحة الخطط الاسبوعية الاستاذ فاضل سلمان المبارك "
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WeeklyPlansBoard;