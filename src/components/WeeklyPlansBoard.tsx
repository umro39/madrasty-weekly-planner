import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Calendar, BookOpen, Loader2, Settings, CalendarDays } from "lucide-react";
import SubjectCard from "./SubjectCard";
import { useWeeklyPlans } from "@/hooks/useWeeklyPlans";

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

const WeeklyPlansBoard = () => {
  const { 
    weeklyPlans, 
    loading, 
    upsertWeeklyPlan, 
    deleteWeeklyPlan,
    getWeeklyPlan, 
    getWeeklyPlans, 
    uploadPlanFile 
  } = useWeeklyPlans();
  
  const [currentWeek, setCurrentWeek] = useState(1);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [customDates, setCustomDates] = useState<Record<number, { start: string; end: string }>>({});
  const [showDateSettings, setShowDateSettings] = useState(false);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [tempStartDate, setTempStartDate] = useState("");
  const [tempEndDate, setTempEndDate] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForWeek, setPasswordForWeek] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  
  const totalWeeks = 15; // إجمالي عدد الأسابيع

  // تحميل التواريخ المخصصة من localStorage
  useEffect(() => {
    const savedDates = localStorage.getItem('customWeekDates');
    if (savedDates) {
      setCustomDates(JSON.parse(savedDates));
    }
  }, []);

  // حفظ التواريخ المخصصة في localStorage
  const saveCustomDates = (dates: Record<number, { start: string; end: string }>) => {
    setCustomDates(dates);
    localStorage.setItem('customWeekDates', JSON.stringify(dates));
  };

  const getCurrentWeekDates = (weekNumber: number) => {
    // إذا كان هناك تاريخ مخصص لهذا الأسبوع، استخدمه
    if (customDates[weekNumber]) {
      return customDates[weekNumber];
    }
    
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

  // دالة لتعديل تواريخ الأسبوع
  const handleEditWeekDates = (weekNumber: number) => {
    setPasswordForWeek(weekNumber);
    setPassword("");
    setShowPasswordDialog(true);
  };

  // دالة للتحقق من الرقم السري وفتح تعديل التاريخ
  const handlePasswordVerification = () => {
    if (password === "123456" && passwordForWeek) {
      const currentDates = getCurrentWeekDates(passwordForWeek);
      setEditingWeek(passwordForWeek);
      setTempStartDate(currentDates.start);
      setTempEndDate(currentDates.end);
      setShowPasswordDialog(false);
      setShowDateSettings(true);
      setPassword("");
      setPasswordForWeek(null);
    }
  };

  // دالة لحفظ التواريخ المعدلة
  const handleSaveDates = () => {
    if (editingWeek && tempStartDate && tempEndDate) {
      const newCustomDates = {
        ...customDates,
        [editingWeek]: {
          start: tempStartDate,
          end: tempEndDate
        }
      };
      saveCustomDates(newCustomDates);
      setShowDateSettings(false);
      setEditingWeek(null);
    }
  };

  // دالة لإعادة تعيين تواريخ الأسبوع للافتراضي
  const handleResetWeekDates = (weekNumber: number) => {
    const newCustomDates = { ...customDates };
    delete newCustomDates[weekNumber];
    saveCustomDates(newCustomDates);
  };

  // دالة لجعل بداية الأسبوع هو التاريخ الحالي
  const setWeekToCurrentDate = (weekNumber: number) => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 6);
    
    const newCustomDates = {
      ...customDates,
      [weekNumber]: {
        start: today.toLocaleDateString('ar-SA'),
        end: endOfWeek.toLocaleDateString('ar-SA')
      }
    };
    saveCustomDates(newCustomDates);
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

  const handleFileUpload = async (file: File, subject: string, grade: string) => {
    const uploadKey = `${subject}-${grade}`;
    
    try {
      setUploadingFiles(prev => new Set(prev).add(uploadKey));
      
      // رفع الملف إلى Supabase Storage
      const { fileName, fileUrl, fileType } = await uploadPlanFile(file, subject, grade, currentWeek);
      
      // حفظ البيانات في قاعدة البيانات
      await upsertWeeklyPlan({
        subject,
        grade,
        week_number: currentWeek,
        file_name: fileName,
        file_type: fileType,
        file_url: fileUrl,
        upload_date: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploadingFiles(prev => {
        const next = new Set(prev);
        next.delete(uploadKey);
        return next;
      });
    }
  };

  const getWeeklyPlanForCard = (subject: string, grade: string) => {
    const plan = getWeeklyPlan(subject, grade, currentWeek);
    if (!plan) return undefined;
    
    return {
      fileName: plan.file_name,
      fileType: plan.file_type,
      uploadDate: new Date(plan.upload_date).toLocaleDateString('ar-SA'),
      url: plan.file_url
    };
  };

  // حساب الخطط للأسبوع الحالي فقط
  const currentWeekPlans = getWeeklyPlans(currentWeek);

  const weekDates = getCurrentWeekDates(currentWeek);
  const uploadedPlansCount = currentWeekPlans.length;
  const totalPlansNeeded = subjects.length * grades.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>جاريٍ تحميل الخطط الأسبوعية...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Card className="bg-gradient-header text-white shadow-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="w-8 h-8" />
              <CardTitle className="text-2xl md:text-3xl font-bold neon-text">
                لوحة الخطط الأسبوعية - متوسطة عمرو بن العاص بالهفوف
              </CardTitle>
            </div>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              <span>الأسبوع {currentWeek} من {totalWeeks}: {weekDates.start} - {weekDates.end}</span>
              <div className="flex gap-1 mr-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setWeekToCurrentDate(currentWeek)}
                  className="text-white hover:bg-white/20"
                  title="جعل بداية الأسبوع هو التاريخ الحالي"
                >
                  <CalendarDays className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditWeekDates(currentWeek)}
                  className="text-white hover:bg-white/20"
                  title="تعديل تواريخ الأسبوع"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
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
                {totalPlansNeeded > 0 ? Math.round((uploadedPlansCount / totalPlansNeeded) * 100) : 0}%
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
                    onDelete={() => {
                      const plan = getWeeklyPlan(subject.name, grade, currentWeek);
                      if (plan?.id) {
                        deleteWeeklyPlan(plan.id);
                      }
                    }}
                    weeklyPlan={getWeeklyPlanForCard(subject.name, grade)}
                    isUploading={uploadingFiles.has(`${subject.name}-${grade}`)}
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

      {/* Password Dialog for Date Settings */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إدخال الرقم السري</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">الرقم السري لتعديل التاريخ</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل الرقم السري"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordVerification();
                  }
                }}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handlePasswordVerification} className="flex-1">
                تأكيد
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword("");
                  setPasswordForWeek(null);
                }}
                className="flex-1"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Date Settings Dialog */}
      <Dialog open={showDateSettings} onOpenChange={setShowDateSettings}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل تواريخ الأسبوع {editingWeek}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="start-date">تاريخ البداية</Label>
              <Input
                id="start-date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                placeholder="مثال: ١٤٤٦/٣/١"
              />
            </div>
            <div>
              <Label htmlFor="end-date">تاريخ النهاية</Label>
              <Input
                id="end-date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                placeholder="مثال: ١٤٤٦/٣/٧"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveDates} className="flex-1">
                حفظ
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDateSettings(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              {editingWeek && customDates[editingWeek] && (
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    if (editingWeek) {
                      handleResetWeekDates(editingWeek);
                      setShowDateSettings(false);
                    }
                  }}
                  className="flex-1"
                >
                  إعادة تعيين
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-8 pb-6">
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            " مصمم لوحة الخطط الاسبوعية الاستاذ فاضل سلمان المبارك "
          </p>
          <div className="flex justify-center">
            <img 
              src="/lovable-uploads/4e474930-65bd-44fe-a478-9e084b987ae0.png" 
              alt="شعار الأستاذ فاضل سلمان المبارك"
              className="h-16 w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default WeeklyPlansBoard;