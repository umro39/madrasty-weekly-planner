import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileImage, FileText, Download, Eye, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubjectCardProps {
  subject: string;
  grade: string;
  color: string;
  onUpload: (file: File) => void;
  weeklyPlan?: {
    fileName: string;
    fileType: 'image' | 'pdf';
    uploadDate: string;
    url: string;
  };
}

const getSubjectColors = (color: string) => {
  const colorMap = {
    islamic: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', accent: 'bg-orange-500' },
    arabic: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', accent: 'bg-blue-500' },
    social: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', accent: 'bg-purple-500' },
    science: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', accent: 'bg-green-500' },
    math: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', accent: 'bg-red-500' },
    art: { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', accent: 'bg-pink-500' },
    physical: { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200', accent: 'bg-yellow-500' },
    family: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', accent: 'bg-rose-500' },
    digital: { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-200', accent: 'bg-cyan-500' },
    critical: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', accent: 'bg-teal-500' },
    english: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', accent: 'bg-indigo-500' }
  };
  
  return colorMap[color as keyof typeof colorMap] || colorMap.arabic;
};

const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  grade,
  color,
  onUpload,
  weeklyPlan
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const colors = getSubjectColors(color);

  const TEACHER_PASSWORD = "معلم2024"; // كلمة السر الموحدة للمعلمين

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFile) {
      setPendingFile(validFile);
      setIsDialogOpen(true);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setIsDialogOpen(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === TEACHER_PASSWORD && pendingFile) {
      onUpload(pendingFile);
      setIsDialogOpen(false);
      setPassword("");
      setPendingFile(null);
    } else {
      alert("كلمة السر غير صحيحة! يرجى المحاولة مرة أخرى.");
      setPassword("");
    }
  };

  const handleUploadClick = () => {
    document.getElementById(`file-${subject}-${grade}`)?.click();
  };

  const handleViewFile = () => {
    if (weeklyPlan?.url) {
      window.open(weeklyPlan.url, '_blank');
    }
  };

  const handleDownloadFile = () => {
    if (weeklyPlan?.url && weeklyPlan?.fileName) {
      const link = document.createElement('a');
      link.href = weeklyPlan.url;
      link.download = weeklyPlan.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-hover",
      "bg-gradient-card border-2 hover:scale-[1.02]",
      isDragging && "border-primary bg-primary/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-foreground">
            {subject}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={cn("font-medium", colors.bg, colors.text, colors.border)}
          >
            {grade}
          </Badge>
        </div>
        <div className={cn(
          "absolute top-0 left-0 w-full h-1 transition-all duration-300",
          colors.accent
        )} />
      </CardHeader>

      <CardContent className="space-y-4">
        {weeklyPlan ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {weeklyPlan.fileType === 'image' ? (
                <FileImage className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              <span>تم الرفع: {weeklyPlan.uploadDate}</span>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={handleViewFile}
              >
                <Eye className="w-4 h-4 mr-2" />
                عرض
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleDownloadFile}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full"
              onClick={handleUploadClick}
            >
              <Upload className="w-4 h-4 mr-2" />
              تحديث الخطة
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300",
              "hover:border-primary hover:bg-primary/5 cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-border"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground mb-1">
              ارفع الخطة الأسبوعية
            </p>
            <p className="text-xs text-muted-foreground">
              اسحب الملف هنا أو انقر للاختيار
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              (صورة أو PDF)
            </p>
          </div>
        )}

        <input
          id={`file-${subject}-${grade}`}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Password Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2 text-lg">
                <Lock className="w-5 h-5 text-primary" />
                تأكيد هوية المعلم
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                يرجى إدخال كلمة السر المخصصة للمعلمين لرفع الخطة الأسبوعية
              </p>
              <Input
                type="password"
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className="text-center"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handlePasswordSubmit}
                  className="flex-1"
                  disabled={!password.trim()}
                >
                  تأكيد الرفع
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDialogOpen(false);
                    setPassword("");
                    setPendingFile(null);
                  }}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SubjectCard;