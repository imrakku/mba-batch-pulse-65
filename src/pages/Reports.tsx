import { useStudents } from "@/hooks/useStudents";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, FileSpreadsheet, Download, FileText, BarChart3, Users, Filter, Calendar, PieChart, Eye, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

type ReportType = 'full' | 'academic' | 'geographic' | 'achievements' | 'contacts';
type ReportFormat = 'csv' | 'json';

export default function Reports() {
  const { data: students, isLoading, error } = useStudents();
  const [selectedReport, setSelectedReport] = useState<ReportType>('full');
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('csv');
  const [includePersonalInfo, setIncludePersonalInfo] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'rollNo', 'name', 'course', 'ugPercentage', 'state'
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [minRecords, setMinRecords] = useState(1);
  const [maxFileSize, setMaxFileSize] = useState(10); // MB

  const reportConfigs = {
    full: {
      title: 'Complete Student Report',
      description: 'All student data including personal, academic, and achievement information',
      fields: ['rollNo', 'name', 'collegeEmail', 'personalEmail', 'phone', 'course', 'gender', 
               'ugProgram', 'ugPercentage', 'class12Percentage', 'class10Percentage', 
               'totalExperience', 'state', 'achievements'],
      icon: Users
    },
    academic: {
      title: 'Academic Performance Report',
      description: 'Focus on academic scores, programs, and educational background',
      fields: ['rollNo', 'name', 'ugProgram', 'ugBranch', 'ugPercentage', 'ugEndYear',
               'class12Percentage', 'class10Percentage', 'achievements'],
      icon: BarChart3
    },
    geographic: {
      title: 'Geographic Distribution Report',
      description: 'Student distribution by state and regional analysis',
      fields: ['rollNo', 'name', 'state', 'course', 'gender'],
      icon: PieChart
    },
    achievements: {
      title: 'Achievements Report',
      description: 'Student achievements, awards, and recognitions',
      fields: ['rollNo', 'name', 'course', 'achievements', 'ugPercentage'],
      icon: Download
    },
    contacts: {
      title: 'Contact Information Report',
      description: 'Communication details for administrative purposes',
      fields: ['rollNo', 'name', 'collegeEmail', 'personalEmail', 'phone', 'course'],
      icon: FileText
    }
  };

  const availableFields = [
    { id: 'rollNo', label: 'Roll Number', category: 'Basic' },
    { id: 'name', label: 'Name', category: 'Basic' },
    { id: 'collegeEmail', label: 'College Email', category: 'Contact' },
    { id: 'personalEmail', label: 'Personal Email', category: 'Contact' },
    { id: 'phone', label: 'Phone', category: 'Contact' },
    { id: 'course', label: 'Course', category: 'Basic' },
    { id: 'gender', label: 'Gender', category: 'Personal' },
    { id: 'dateOfBirth', label: 'Date of Birth', category: 'Personal' },
    { id: 'ugProgram', label: 'UG Program', category: 'Academic' },
    { id: 'ugBranch', label: 'UG Branch', category: 'Academic' },
    { id: 'ugPercentage', label: 'UG Percentage', category: 'Academic' },
    { id: 'ugEndYear', label: 'UG End Year', category: 'Academic' },
    { id: 'class12Percentage', label: 'Class 12 %', category: 'Academic' },
    { id: 'class10Percentage', label: 'Class 10 %', category: 'Academic' },
    { id: 'totalExperience', label: 'Experience (months)', category: 'Professional' },
    { id: 'state', label: 'State', category: 'Geographic' },
    { id: 'achievements', label: 'Achievements', category: 'Achievements' },
  ];

  // Data validation and quality checks
  const dataQuality = useMemo(() => {
    if (!students || students.length === 0) return null;

    const totalRecords = students.length;
    const fieldsWithData = selectedFields.map(field => ({
      field,
      completeness: Math.round((students.filter(s => (s as any)[field] && (s as any)[field] !== '').length / totalRecords) * 100)
    }));

    const avgCompleteness = fieldsWithData.reduce((acc, f) => acc + f.completeness, 0) / fieldsWithData.length;
    const estimatedSizeKB = Math.round((totalRecords * selectedFields.length * 25) / 1024);
    const estimatedSizeMB = estimatedSizeKB / 1024;

    return {
      totalRecords,
      fieldsWithData,
      avgCompleteness: Math.round(avgCompleteness),
      estimatedSizeKB,
      estimatedSizeMB,
      isLargeFile: estimatedSizeMB > maxFileSize,
      hasIncompleteData: avgCompleteness < 95
    };
  }, [students, selectedFields, maxFileSize]);

  const reportStats = useMemo(() => {
    if (!students || students.length === 0) return null;

    return {
      totalStudents: students.length,
      totalReports: Object.keys(reportConfigs).length,
      fieldsSelected: selectedFields.length,
      estimatedSize: dataQuality ? `${dataQuality.estimatedSizeKB}KB` : '0KB'
    };
  }, [students, selectedFields, dataQuality]);

  const generateReport = useCallback(async (format: ReportFormat) => {
    if (!students || students.length === 0) {
      toast({
        title: "No Data Available",
        description: "No student data to export",
        variant: "destructive"
      });
      return;
    }

    if (selectedFields.length === 0) {
      toast({
        title: "No Fields Selected",
        description: "Please select at least one field to export",
        variant: "destructive"
      });
      return;
    }

    if (dataQuality?.isLargeFile) {
      const confirmed = window.confirm(
        `The estimated file size is ${dataQuality.estimatedSizeMB.toFixed(1)}MB, which exceeds the recommended ${maxFileSize}MB limit. This may cause performance issues. Continue anyway?`
      );
      if (!confirmed) return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const config = reportConfigs[selectedReport];
      const fieldsToInclude = selectedFields.length > 0 ? selectedFields : config.fields;
      
      // Progress: Data validation
      setGenerationProgress(20);
      
      // Filter and search data
      let filteredStudents = students;
      if (searchFilter.trim()) {
        filteredStudents = students.filter(student => 
          student.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchFilter.toLowerCase()) ||
          student.course.toLowerCase().includes(searchFilter.toLowerCase())
        );
      }

      if (filteredStudents.length < minRecords) {
        toast({
          title: "Insufficient Data",
          description: `Found ${filteredStudents.length} records, but minimum ${minRecords} required`,
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Progress: Data processing
      setGenerationProgress(50);

      // Process data with better sanitization
      const processedData = await new Promise<any[]>((resolve) => {
        setTimeout(() => {
          const data = filteredStudents.map(student => {
            const filtered: any = {};
            fieldsToInclude.forEach(field => {
              let value = (student as any)[field];
              
              if (field === 'achievements' && student.achievements) {
                value = student.achievements.join('; ');
              } else if (value === null || value === undefined) {
                value = '';
              } else if (typeof value === 'string') {
                // Sanitize string values
                value = value.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
              }
              
              filtered[field] = value;
            });
            return filtered;
          });
          resolve(data);
        }, 100);
      });

      // Progress: File generation
      setGenerationProgress(80);

      let blob: Blob;
      let filename: string;
      let mimeType: string;

      if (format === 'csv') {
        // Enhanced CSV generation with proper escaping
        const headers = fieldsToInclude.map(field => `"${field}"`).join(',');
        const rows = processedData.map(row => 
          fieldsToInclude.map(field => {
            const value = String(row[field] || '');
            return `"${value}"`;
          }).join(',')
        );
        const csvContent = '\uFEFF' + [headers, ...rows].join('\n'); // Add BOM for UTF-8
        
        blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        mimeType = 'text/csv';
        filename = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Enhanced JSON generation
        const jsonData = {
          metadata: {
            reportType: selectedReport,
            generatedAt: new Date().toISOString(),
            totalRecords: processedData.length,
            fields: fieldsToInclude,
            dataQuality: dataQuality
          },
          data: processedData
        };
        
        const jsonContent = JSON.stringify(jsonData, null, 2);
        blob = new Blob([jsonContent], { type: 'application/json' });
        mimeType = 'application/json';
        filename = `${selectedReport}_report_${new Date().toISOString().split('T')[0]}.json`;
      }

      // Progress: Download
      setGenerationProgress(95);

      // Enhanced download with retry mechanism
      let downloadSuccess = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!downloadSuccess && retryCount < maxRetries) {
        try {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          downloadSuccess = true;
        } catch (error) {
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      setGenerationProgress(100);

      if (downloadSuccess) {
        toast({
          title: "Report Generated Successfully",
          description: `${config.title} with ${processedData.length} records has been downloaded`,
        });
      } else {
        throw new Error('Download failed after multiple attempts');
      }

    } catch (error) {
      console.error('Report generation failed:', error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setTimeout(() => setGenerationProgress(0), 2000);
    }
  }, [students, selectedFields, selectedReport, reportConfigs, dataQuality, searchFilter, minRecords, maxFileSize]);

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(f => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <div className="text-muted-foreground">Loading report data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
          <div className="text-muted-foreground">Failed to load student data</div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!reportStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto" />
          <div className="text-muted-foreground">No data available for reports</div>
        </div>
      </div>
    );
  }

  const currentConfig = reportConfigs[selectedReport];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-heading text-foreground">Reports & Exports</h1>
        <p className="text-muted-foreground">Generate and download comprehensive reports of student data</p>
      </div>

      {/* Report Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={reportStats.totalStudents}
          description="Students in database"
          icon={Users}
        />
        <StatCard
          title="Report Types"
          value={reportStats.totalReports}
          description="Available report formats"
          icon={FileSpreadsheet}
        />
        <StatCard
          title="Fields Selected"
          value={reportStats.fieldsSelected}
          description="Data columns to export"
          icon={Filter}
        />
        <StatCard
          title="Estimated Size"
          value={reportStats.estimatedSize}
          description="Approximate file size"
          icon={Download}
        />
      </div>

      {/* Data Quality Indicators */}
      {dataQuality && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={`dashboard-card ${dataQuality.hasIncompleteData ? 'border-yellow-500/30' : 'border-green-500/30'}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {dataQuality.hasIncompleteData ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <div>
                  <div className="font-medium">Data Completeness</div>
                  <div className="text-sm text-muted-foreground">{dataQuality.avgCompleteness}% complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`dashboard-card ${dataQuality.isLargeFile ? 'border-orange-500/30' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                {dataQuality.isLargeFile && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                <div>
                  <div className="font-medium">File Size</div>
                  <div className="text-sm text-muted-foreground">
                    {dataQuality.estimatedSizeMB < 1 
                      ? `${dataQuality.estimatedSizeKB}KB` 
                      : `${dataQuality.estimatedSizeMB.toFixed(1)}MB`}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-500" />
                <div>
                  <div className="font-medium">Active Filters</div>
                  <div className="text-sm text-muted-foreground">
                    {searchFilter ? 'Search applied' : 'No filters'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Filters */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Advanced Filters & Settings
          </CardTitle>
          <CardDescription>
            Configure data filters and export settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-filter">Search Filter</Label>
              <Input
                id="search-filter"
                placeholder="Filter by name, roll no, or course"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min-records">Minimum Records</Label>
              <Input
                id="min-records"
                type="number"
                min="1"
                value={minRecords}
                onChange={(e) => setMinRecords(parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-file-size">Max File Size (MB)</Label>
              <Input
                id="max-file-size"
                type="number"
                min="1"
                max="100"
                value={maxFileSize}
                onChange={(e) => setMaxFileSize(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Selection */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              Select Report Type
            </CardTitle>
            <CardDescription>
              Choose the type of report you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedReport} onValueChange={(value: ReportType) => setSelectedReport(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reportConfigs).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.title}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <currentConfig.icon className="h-5 w-5 text-primary" />
                <h3 className="font-medium">{currentConfig.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{currentConfig.description}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select value={selectedFormat} onValueChange={(value: ReportFormat) => setSelectedFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                  <SelectItem value="json">JSON (Data format)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Field Selection */}
        <Card className="dashboard-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Customize Fields
            </CardTitle>
            <CardDescription>
              Select which data fields to include in your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedFields(currentConfig.fields)}
              >
                Use Default Fields
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedFields([])}
              >
                Clear All
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {availableFields.map(field => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.id}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <label htmlFor={field.id} className="text-sm flex-1 cursor-pointer">
                    {field.label}
                  </label>
                  <Badge variant="outline" className="text-xs">
                    {field.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generate Report */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Ready to download your customized report
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating report...</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          )}

          {/* Preview Button */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              disabled={selectedFields.length === 0 || isGenerating}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Preview Data'}
            </Button>
          </div>

          {/* Data Preview */}
          {showPreview && students && selectedFields.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      {selectedFields.slice(0, 5).map(field => (
                        <th key={field} className="p-2 text-left font-medium">
                          {availableFields.find(f => f.id === field)?.label || field}
                        </th>
                      ))}
                      {selectedFields.length > 5 && <th className="p-2 text-left">...</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 3).map((student, idx) => (
                      <tr key={idx} className="border-t">
                        {selectedFields.slice(0, 5).map(field => (
                          <td key={field} className="p-2 truncate max-w-32">
                            {String((student as any)[field] || '')}
                          </td>
                        ))}
                        {selectedFields.length > 5 && <td className="p-2">...</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {students.length > 3 && (
                  <div className="p-2 text-center text-muted-foreground bg-muted/20 text-sm">
                    ... and {students.length - 3} more records
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generation Summary */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <div className="font-medium">{currentConfig.title}</div>
              <div className="text-sm text-muted-foreground">
                {reportStats.totalStudents} students • {selectedFields.length} fields • {selectedFormat.toUpperCase()} format
                {searchFilter && ` • Filtered`}
              </div>
              {dataQuality && (
                <div className="text-xs text-muted-foreground mt-1">
                  Quality: {dataQuality.avgCompleteness}% • Size: ~{dataQuality.estimatedSizeKB}KB
                </div>
              )}
            </div>
            <Button 
              onClick={() => generateReport(selectedFormat)}
              disabled={selectedFields.length === 0 || isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <Card className="dashboard-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Quick Reports
          </CardTitle>
          <CardDescription>
            Pre-configured reports for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(reportConfigs).map(([key, config]) => (
              <div key={key} className="p-4 border rounded-lg hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <config.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">{config.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isGenerating}
                  onClick={() => {
                    setSelectedReport(key as ReportType);
                    setSelectedFields(config.fields);
                    generateReport('csv');
                  }}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-3 w-3 mr-1" />
                  )}
                  Quick CSV
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}