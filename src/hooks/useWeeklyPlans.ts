import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeeklyPlan {
  id?: string;
  subject: string;
  grade: string;
  week_number: number;
  file_name: string;
  file_type: 'image' | 'pdf';
  file_url: string;
  upload_date: string;
  created_at?: string;
  updated_at?: string;
}

export const useWeeklyPlans = () => {
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // تحميل الخطط من قاعدة البيانات
  const fetchWeeklyPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('weekly_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []).map(plan => ({
        ...plan,
        file_type: plan.file_type as 'image' | 'pdf'
      }));
      
      setWeeklyPlans(typedData);
    } catch (error) {
      console.error('Error fetching weekly plans:', error);
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل الخطط الأسبوعية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // إضافة أو تحديث خطة
  const upsertWeeklyPlan = async (planData: Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('weekly_plans')
        .upsert({
          subject: planData.subject,
          grade: planData.grade,
          week_number: planData.week_number,
          file_name: planData.file_name,
          file_type: planData.file_type,
          file_url: planData.file_url,
          upload_date: planData.upload_date
        }, {
          onConflict: 'subject,grade,week_number'
        })
        .select()
        .single();

      if (error) throw error;

      // تحديث الحالة المحلية
      setWeeklyPlans(prev => {
        const filtered = prev.filter(plan => 
          !(plan.subject === planData.subject && 
            plan.grade === planData.grade && 
            plan.week_number === planData.week_number)
        );
        const typedData = {
          ...data,
          file_type: data.file_type as 'image' | 'pdf'
        };
        return [...filtered, typedData];
      });

      toast({
        title: "تم حفظ الخطة بنجاح! ✅",
        description: `تم حفظ خطة ${planData.subject} - ${planData.grade} للأسبوع ${planData.week_number}`,
      });

      return data;
    } catch (error) {
      console.error('Error saving weekly plan:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الخطة الأسبوعية",
        variant: "destructive"
      });
      throw error;
    }
  };

  // حذف خطة (مع حذف الملف من التخزين)
  const deleteWeeklyPlan = async (id: string) => {
    try {
      // البحث عن الخطة أولاً للحصول على رابط الملف
      const planToDelete = weeklyPlans.find(plan => plan.id === id);
      
      if (planToDelete?.file_url) {
        // استخراج مسار الملف من الرابط
        const url = new URL(planToDelete.file_url);
        const filePath = url.pathname.split('/').pop();
        
        if (filePath) {
          // حذف الملف من التخزين
          const { error: deleteFileError } = await supabase.storage
            .from('plans')
            .remove([filePath]);
          
          if (deleteFileError) {
            console.warn('Warning: Could not delete file from storage:', deleteFileError);
          }
        }
      }

      // حذف السجل من قاعدة البيانات
      const { error } = await supabase
        .from('weekly_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWeeklyPlans(prev => prev.filter(plan => plan.id !== id));

      toast({
        title: "تم حذف الخطة ✅",
        description: "تم حذف الخطة الأسبوعية والملف المرفق بنجاح"
      });
    } catch (error) {
      console.error('Error deleting weekly plan:', error);
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف الخطة الأسبوعية",
        variant: "destructive"
      });
    }
  };

  // الحصول على خطة محددة
  const getWeeklyPlan = (subject: string, grade: string, weekNumber: number) => {
    return weeklyPlans.find(plan => 
      plan.subject === subject && 
      plan.grade === grade && 
      plan.week_number === weekNumber
    );
  };

  // الحصول على خطط أسبوع محدد
  const getWeeklyPlans = (weekNumber: number) => {
    return weeklyPlans.filter(plan => plan.week_number === weekNumber);
  };

  // رفع ملف إلى Supabase Storage
  const uploadPlanFile = async (file: File, subject: string, grade: string, weekNumber: number) => {
    try {
      console.log('Starting file upload:', { file: file.name, subject, grade, weekNumber });
      
      const fileExt = file.name.split('.').pop();
      // استخدام أسماء إنجليزية فقط لتجنب مشاكل Supabase Storage
      const sanitizedSubject = encodeURIComponent(subject).replace(/%/g, '');
      const sanitizedGrade = encodeURIComponent(grade).replace(/%/g, '');
      const fileName = `plan-${sanitizedSubject}-${sanitizedGrade}-week${weekNumber}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // إزالة مجلد plans من المسار

      console.log('Uploading file to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('plans')
        .upload(filePath, file);

      console.log('Upload result:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('plans')
        .getPublicUrl(filePath);

      console.log('Generated public URL:', publicUrl);

      return {
        fileName: file.name,
        fileUrl: publicUrl,
        fileType: file.type.startsWith('image/') ? 'image' as const : 'pdf' as const
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ في رفع الملف",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchWeeklyPlans();
  }, []);

  return {
    weeklyPlans,
    loading,
    fetchWeeklyPlans,
    upsertWeeklyPlan,
    deleteWeeklyPlan,
    getWeeklyPlan,
    getWeeklyPlans,
    uploadPlanFile
  };
};