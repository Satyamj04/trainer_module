import { useEffect, useState } from 'react';
import { courseService } from '../services/courseService';
import { unitService } from '../services/unitService';
import { quizService } from '../services/quizService';
import { Course, Unit, UnitType } from '../types';
import {
  ArrowLeft,
  Plus,
  FileText,
  Video,
  Music,
  Presentation,
  Package,
  HelpCircle,
  ClipboardList,
  FileCheck,
  MessageSquare,
  Layout,
  GripVertical,
  Trash2
} from 'lucide-react';
import { VideoUnitEditor } from './units/VideoUnitEditor';
import { AudioUnitEditor } from './units/AudioUnitEditor';
import { PresentationUnitEditor } from './units/PresentationUnitEditor';
import { TextUnitEditor } from './units/TextUnitEditor';
import { PageUnitEditor } from './units/PageUnitEditor';
import { QuizEditor } from './units/QuizEditor';
import { AssignmentEditor } from './units/AssignmentEditor';
import { ScormEditor } from './units/ScormEditor';
import { SurveyEditor } from './units/SurveyEditor';

interface CourseBuilderProps {
  courseId: string;
  onNavigate: (page: string, data?: any) => void;
}

const UNIT_TYPES = [
  { type: 'text' as UnitType, label: 'Text', icon: FileText },
  { type: 'video' as UnitType, label: 'Video', icon: Video },
  { type: 'audio' as UnitType, label: 'Audio', icon: Music },
  { type: 'presentation' as UnitType, label: 'Presentation', icon: Presentation },
  { type: 'scorm' as UnitType, label: 'SCORM', icon: Package },
  { type: 'xapi' as UnitType, label: 'xAPI', icon: Package },
  { type: 'quiz' as UnitType, label: 'Quiz', icon: HelpCircle },
  { type: 'test' as UnitType, label: 'Test', icon: ClipboardList },
  { type: 'assignment' as UnitType, label: 'Assignment', icon: FileCheck },
  { type: 'survey' as UnitType, label: 'Survey', icon: MessageSquare },
  { type: 'page' as UnitType, label: 'Page', icon: Layout }
];

export function CourseBuilder({ courseId, onNavigate }: CourseBuilderProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseData, unitsData] = await Promise.all([
        courseService.getCourse(courseId),
        unitService.getUnits(courseId)
      ]);
      setCourse(courseData);
      setUnits(Array.isArray(unitsData) ? unitsData : []);
    } catch (error) {
      console.error('Error loading course:', error);
      setCourse(null);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUnit = async (type: UnitType) => {
    try {
      const newUnit = await unitService.createUnitBackend({
        course_id: courseId,
        type,
        title: `New ${type} unit`,
        is_required: true
      });
      setUnits([...units, newUnit]);
      setShowAddUnitModal(false);
      setSelectedUnit(newUnit);
    } catch (error: any) {
      console.error('Error creating unit:', error);
      const msg = (error?.message || '').toLowerCase();
      if (msg.includes('row-level security') || msg.includes('permission') || msg.includes('trainer token')) {
        alert(`Failed to create unit: ${error?.message}\n\nQuick fix: ensure you're signed in as a trainer or set a DRF trainer token in localStorage.\nRun: python project/scripts/create_token_sql.py trainer_user@example.com\nThen in browser console run: localStorage.setItem("trainerToken","<token>")`);
      } else {
        alert(`Failed to create unit: ${error?.message || String(error)}`);
      }
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Are you sure you want to delete this unit?')) return;

    try {
      await unitService.deleteUnitBackend(unitId);
      setUnits(units.filter(u => u.id !== unitId));
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(null);
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Failed to delete unit');
    }
  };

  const handleUpdateUnit = async (unitId: string, updates: Partial<Unit>) => {
    try {
      const updated = await unitService.updateUnitBackend(unitId, updates);
      setUnits(units.map(u => u.id === unitId ? updated : u));
      if (selectedUnit?.id === unitId) {
        setSelectedUnit(updated);
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      alert('Failed to update unit');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('courses')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
              <p className="text-sm text-gray-600">Course Builder</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('enrollments', { courseId })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Enrollments
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => setShowAddUnitModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Add Unit</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {units.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Layout className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No units yet</p>
                <p className="text-xs">Click "Add Unit" to start</p>
              </div>
            ) : (
              units.map((unit, index) => {
                const UnitIcon = UNIT_TYPES.find(t => t.type === unit.type)?.icon || FileText;
                return (
                  <div
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUnit?.id === unit.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <UnitIcon className="w-5 h-5 text-gray-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{unit.title}</p>
                      <p className="text-xs text-gray-500 capitalize">{unit.type}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUnit(unit.id);
                      }}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
          {selectedUnit ? (
            <UnitEditor
              unit={selectedUnit}
              onUpdate={(updates) => handleUpdateUnit(selectedUnit.id, updates)}
              onNavigate={onNavigate}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Layout className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Select a unit to edit</p>
                <p className="text-sm">Or add a new unit to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddUnitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add New Unit</h2>
              <p className="text-gray-600 mt-1">Choose a unit type</p>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              {UNIT_TYPES.map((unitType) => (
                <button
                  key={unitType.type}
                  onClick={() => handleAddUnit(unitType.type)}
                  className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-blue-50 hover:border-blue-500 border-2 border-transparent transition-all"
                >
                  <unitType.icon className="w-8 h-8 text-gray-600" />
                  <span className="font-medium text-gray-900">{unitType.label}</span>
                </button>
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddUnitModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UnitEditor({ unit, onUpdate, onNavigate }: { unit: Unit; onUpdate: (updates: Partial<Unit>) => void; onNavigate: (page: string, data?: any) => void }) {
  const [unitData, setUnitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUnitData();
  }, [unit.id]);

  const loadUnitData = async () => {
    try {
      setLoading(true);
      const data = await unitService.getUnitDetails(unit.id, unit.type);
      setUnitData(data);
    } catch (error) {
      console.error('Error loading unit details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = async (contentData: any) => {
    try {
      await unitService.updateUnitContent(unit.id, unit.type, contentData);
      setUnitData(contentData);
    } catch (error) {
      console.error('Error updating unit content:', error);
      alert('Failed to update unit content');
    }
  };

  const renderEditor = () => {
    if (loading) {
      return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
    }

    switch (unit.type) {
      case 'video':
        return <VideoUnitEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'audio':
        return <AudioUnitEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'presentation':
        return <PresentationUnitEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'text':
        return <TextUnitEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'page':
        return <PageUnitEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'quiz':
      case 'test':
        return <QuizEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} onNavigate={onNavigate} />;
      case 'assignment':
        return <AssignmentEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'scorm':
      case 'xapi':
        return <ScormEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      case 'survey':
        return <SurveyEditor unitId={unit.id} initialData={unitData} onChange={handleContentChange} />;
      default:
        return <div className="text-center py-12 text-gray-500">Editor for {unit.type} not implemented yet</div>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Unit Title</label>
        <input
          type="text"
          value={unit.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={unit.is_required}
          onChange={(e) => onUpdate({ is_required: e.target.checked })}
          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <div>
          <p className="font-medium text-gray-900">Required Unit</p>
          <p className="text-sm text-gray-600">Learners must complete this unit</p>
        </div>
      </label>

      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">{unit.type} Content</h3>
        {renderEditor()}
      </div>
    </div>
  );
}
