import { Construction, Calendar, Mail, Phone, School } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UnderConstruction = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-glow">
        <CardContent className="text-center p-8 md:p-12">
          {/* أيقونة الإنشاء */}
          <div className="mb-8">
            <div className="relative inline-block">
              <Construction className="w-24 h-24 mx-auto text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-150"></div>
            </div>
          </div>

          {/* العنوان */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 neon-text">
              موقع تحت الإنشاء
            </h1>
            <div className="flex items-center justify-center gap-2 text-xl text-primary font-semibold">
              <School className="w-6 h-6" />
              <span>متوسطة عمرو بن العاص بالهفوف</span>
            </div>
          </div>

          {/* الرسالة الرئيسية */}
          <div className="mb-8 space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              نحن نعمل حالياً على تطوير منصة الخطط الأسبوعية الجديدة لتقديم أفضل خدمة تعليمية
            </p>
            <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <Calendar className="w-5 h-5" />
                <span>الإطلاق المتوقع: قريباً جداً</span>
              </div>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="mb-8 space-y-3">
            <h3 className="text-lg font-semibold text-foreground mb-4">للاستفسار يمكنكم التواصل معنا:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">البريد الإلكتروني</div>
                    <div className="font-medium">school@example.com</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-primary/20 bg-primary/5">
                <CardContent className="p-4 flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">الهاتف</div>
                    <div className="font-medium">013-XXX-XXXX</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* شكراً */}
          <div className="border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              نشكركم على صبركم وتفهمكم، ونعدكم بتقديم أفضل خدمة ممكنة
            </p>
          </div>

          {/* أيقونات متحركة */}
          <div className="mt-8 flex justify-center space-x-4 rtl:space-x-reverse">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderConstruction;