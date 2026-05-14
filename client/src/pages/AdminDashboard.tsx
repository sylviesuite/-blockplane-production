import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Upload,
  TrendingUp,
  Users,
  Database,
  Activity,
  CheckCircle,
  XCircle,
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [isLoading, user, navigate]);

  // Render nothing while session resolves or redirect is in flight
  if (isLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage materials, view analytics, and monitor platform usage
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Admin
          </Badge>
          <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-gray-600 hover:text-gray-900">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="materials" className="space-y-4">
          <MaterialsTab />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab />
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <BulkImportTab />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <SubmissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OverviewTab() {
  const { data: materialStats } = trpc.admin.getMaterialStats.useQuery();
  const { data: usageStats } = trpc.admin.getUsageStats.useQuery({ daysAgo: 30 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Total Materials
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{materialStats?.total || 0}</div>
          <p className="text-xs text-gray-600 mt-1">in database</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Total Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{usageStats?.totalEvents || 0}</div>
          <p className="text-xs text-gray-600 mt-1">last 30 days</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Carbon Saved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {usageStats?.totalCarbonSaved ? Math.round(usageStats.totalCarbonSaved) : 0}
          </div>
          <p className="text-xs text-gray-600 mt-1">kg CO₂e saved</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Platform Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="text-xl font-bold">Healthy</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">all systems operational</p>
        </CardContent>
      </Card>

      {materialStats?.byCategory && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Materials by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {materialStats.byCategory.map((cat: any) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="font-medium">{cat.category}</span>
                  <Badge variant="secondary">{cat.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {usageStats?.mostViewedMaterials && usageStats.mostViewedMaterials.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Most Viewed Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageStats.mostViewedMaterials.slice(0, 5).map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{material.materialName}</span>
                  <Badge variant="secondary">{material.count} views</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MaterialsTab() {
  const { data: materials, refetch } = trpc.materials.getAll.useQuery();
  const deleteMaterial = trpc.admin.deleteMaterial.useMutation();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteMaterial.mutateAsync({ id });
      toast.success('Material deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete material');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Material Management</h2>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Material
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Material</CardTitle>
            <CardDescription>
              Add a new material to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateMaterialForm onSuccess={() => {
              setShowCreateForm(false);
              refetch();
            }} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Materials ({materials?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {materials?.map((material) => (
              <div key={material.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{material.name}</div>
                  <div className="text-sm text-gray-600">
                    {material.category} • {material.totalCarbon} kg CO₂e • ${material.pricing?.costPerUnit}/{material.functionalUnit}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toast.info('Edit feature coming soon')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(material.id, material.name)}
                    disabled={deleteMaterial.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CreateMaterialForm({ onSuccess }: { onSuccess: () => void }) {
  const createMaterial = trpc.admin.createMaterial.useMutation();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Timber' as 'Timber' | 'Steel' | 'Concrete' | 'Earth',
    functionalUnit: 'm³',
    totalCarbon: 0,
    description: '',
    'A1-A3': 0,
    'A4': 0,
    'A5': 0,
    'B': 0,
    'C1-C4': 0,
    risScore: 50,
    lisScore: 50,
    costPerUnit: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMaterial.mutateAsync({
        name: formData.name,
        category: formData.category,
        functionalUnit: formData.functionalUnit,
        totalCarbon: formData.totalCarbon,
        description: formData.description,
        lifecyclePhases: {
          'A1-A3': formData['A1-A3'],
          'A4': formData['A4'],
          'A5': formData['A5'],
          'B': formData['B'],
          'C1-C4': formData['C1-C4'],
        },
        risScore: formData.risScore,
        lisScore: formData.lisScore,
        costPerUnit: formData.costPerUnit,
      });

      toast.success('Material created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create material');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Timber">Timber</SelectItem>
              <SelectItem value="Steel">Steel</SelectItem>
              <SelectItem value="Concrete">Concrete</SelectItem>
              <SelectItem value="Earth">Earth</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="functionalUnit">Functional Unit *</Label>
          <Input
            id="functionalUnit"
            value={formData.functionalUnit}
            onChange={(e) => setFormData({ ...formData, functionalUnit: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalCarbon">Total Carbon (kg CO₂e) *</Label>
          <Input
            id="totalCarbon"
            type="number"
            step="0.01"
            value={formData.totalCarbon}
            onChange={(e) => setFormData({ ...formData, totalCarbon: parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPerUnit">Cost per Unit ($) *</Label>
          <Input
            id="costPerUnit"
            type="number"
            step="0.01"
            value={formData.costPerUnit}
            onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="space-y-2">
          <Label htmlFor="A1-A3">A1-A3 *</Label>
          <Input
            id="A1-A3"
            type="number"
            step="0.01"
            value={formData['A1-A3']}
            onChange={(e) => setFormData({ ...formData, 'A1-A3': parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="A4">A4 *</Label>
          <Input
            id="A4"
            type="number"
            step="0.01"
            value={formData['A4']}
            onChange={(e) => setFormData({ ...formData, 'A4': parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="A5">A5 *</Label>
          <Input
            id="A5"
            type="number"
            step="0.01"
            value={formData['A5']}
            onChange={(e) => setFormData({ ...formData, 'A5': parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="B">B *</Label>
          <Input
            id="B"
            type="number"
            step="0.01"
            value={formData['B']}
            onChange={(e) => setFormData({ ...formData, 'B': parseFloat(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="C1-C4">C1-C4 *</Label>
          <Input
            id="C1-C4"
            type="number"
            step="0.01"
            value={formData['C1-C4']}
            onChange={(e) => setFormData({ ...formData, 'C1-C4': parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="risScore">RIS Score (0-100) *</Label>
          <Input
            id="risScore"
            type="number"
            min="0"
            max="100"
            value={formData.risScore}
            onChange={(e) => setFormData({ ...formData, risScore: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lisScore">LIS Score (0-100) *</Label>
          <Input
            id="lisScore"
            type="number"
            min="0"
            max="100"
            value={formData.lisScore}
            onChange={(e) => setFormData({ ...formData, lisScore: parseInt(e.target.value) })}
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={createMaterial.isPending}>
        {createMaterial.isPending ? 'Creating...' : 'Create Material'}
      </Button>
    </form>
  );
}

function AnalyticsTab() {
  const { data: usageStats } = trpc.admin.getUsageStats.useQuery({ daysAgo: 30 });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Usage Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageStats?.eventsByType?.map((event: any) => (
                <div key={event.eventType} className="flex items-center justify-between">
                  <span className="font-medium capitalize">{event.eventType.replace(/_/g, ' ')}</span>
                  <Badge variant="secondary">{event.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Viewed Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {usageStats?.mostViewedMaterials?.map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{material.materialName}</span>
                  <Badge variant="secondary">{material.count} views</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SubmissionsTab() {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data: submissions, isLoading, refetch } = trpc.admin.getSubmissions.useQuery({ status: statusFilter });
  const reviewSubmission = trpc.admin.reviewSubmission.useMutation();

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await reviewSubmission.mutateAsync({ id, status, reviewerNotes: notes[id] || undefined });
      toast.success(`Submission ${status}`);
      setNotes((prev) => { const n = { ...prev }; delete n[id]; return n; });
      refetch();
    } catch {
      toast.error(`Failed to ${status} submission`);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Material Submissions</h2>
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">Loading submissions…</CardContent>
        </Card>
      )}

      {!isLoading && (!submissions || submissions.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            No {statusFilter} submissions
          </CardContent>
        </Card>
      )}

      {submissions?.map((sub: any) => (
        <Card key={sub.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">{sub.name}</CardTitle>
                <CardDescription className="mt-1 space-x-2">
                  <span>{sub.category}</span>
                  {sub.functional_unit && <span>· {sub.functional_unit}</span>}
                  {sub.carbon_value != null && <span>· {sub.carbon_value} kg CO₂e</span>}
                  {sub.cost_per_unit != null && <span>· ${sub.cost_per_unit}/{sub.functional_unit}</span>}
                </CardDescription>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[sub.status] ?? ''}`}>
                {sub.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {sub.description && (
              <p className="text-sm text-gray-700">{sub.description}</p>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
              {sub.manufacturer && <span><span className="font-medium">Manufacturer:</span> {sub.manufacturer}</span>}
              {sub.source && (
                <span>
                  <span className="font-medium">Source:</span>{' '}
                  <a href={sub.source} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline truncate max-w-xs inline-block align-bottom">
                    {sub.source}
                  </a>
                </span>
              )}
              {sub.submitter_email && <span><span className="font-medium">Submitter:</span> {sub.submitter_email}</span>}
              {sub.submitter_name && <span><span className="font-medium">Name:</span> {sub.submitter_name}</span>}
              {sub.created_at && (
                <span><span className="font-medium">Submitted:</span> {new Date(sub.created_at).toLocaleDateString()}</span>
              )}
            </div>

            {sub.status === 'pending' && (
              <div className="pt-2 space-y-2">
                <Textarea
                  placeholder="Reviewer notes (optional)"
                  rows={2}
                  value={notes[sub.id] ?? ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="gap-1 bg-green-600 hover:bg-green-700"
                    disabled={reviewSubmission.isPending}
                    onClick={() => handleReview(sub.id, 'approved')}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                    disabled={reviewSubmission.isPending}
                    onClick={() => handleReview(sub.id, 'rejected')}
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {sub.reviewer_notes && (
              <p className="text-xs text-gray-500 border-t pt-2"><span className="font-medium">Notes:</span> {sub.reviewer_notes}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function BulkImportTab() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const bulkImport = trpc.admin.bulkImport.useMutation();

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      const materials = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        // Parse CSV row into material object
        // This is a simplified example - production would need robust CSV parsing
        const material = {
          name: values[0],
          category: values[1] as 'Timber' | 'Steel' | 'Concrete' | 'Earth',
          functionalUnit: values[2],
          totalCarbon: parseFloat(values[3]),
          description: values[4] || undefined,
          lifecyclePhases: {
            'A1-A3': parseFloat(values[5]),
            'A4': parseFloat(values[6]),
            'A5': parseFloat(values[7]),
            'B': parseFloat(values[8]),
            'C1-C4': parseFloat(values[9]),
          },
          risScore: parseInt(values[10]),
          lisScore: parseInt(values[11]),
          costPerUnit: parseFloat(values[12]),
        };
        materials.push(material);
      }

      const result = await bulkImport.mutateAsync({ materials });
      toast.success(`Imported ${result.imported} of ${result.total} materials`);
      if (result.errors.length > 0) {
        console.error('Import errors:', result.errors);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import materials');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bulk Import</h2>

      <Card>
        <CardHeader>
          <CardTitle>Import Materials from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file with material data to import multiple materials at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              CSV format: name, category, functionalUnit, totalCarbon, description, A1-A3, A4, A5, B, C1-C4, risScore, lisScore, costPerUnit
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="import-file">CSV File</Label>
            <Input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>

          <Button
            onClick={handleImport}
            disabled={!importFile || bulkImport.isPending}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {bulkImport.isPending ? 'Importing...' : 'Import Materials'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
