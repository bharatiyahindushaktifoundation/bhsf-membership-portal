import { useEffect, useState } from "react";
import { homeContentService } from "../../services";
import { fileUrl } from "../../services/api";
import Spinner from "../../components/Spinner.jsx";

const SECTION_LABELS = {
  HERO: "Hero Section",
  ABOUT: "About Organization",
  OBJECTIVES: "Objectives & Goals",
  CONTACT: "Contact Section",
};

function SectionEditor({ section, data, onSaved }) {
  const [heading, setHeading] = useState(data.heading || "");
  const [body, setBody] = useState(data.body || "");
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("body", body);
    if (image) formData.append("image", image);

    setSaving(true);
    setSaved(false);
    try {
      const res = await homeContentService.updateSection(section, formData);
      onSaved(section, res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="card space-y-3">
      <h2 className="font-semibold text-darkgray">{SECTION_LABELS[section]}</h2>
      <div>
        <label className="label">Heading</label>
        <input className="input-field" value={heading} onChange={(e) => setHeading(e.target.value)} />
      </div>
      <div>
        <label className="label">Body Text</label>
        <textarea rows={4} className="input-field" value={body} onChange={(e) => setBody(e.target.value)} />
      </div>
      <div>
        <label className="label">Image (optional)</label>
        {data.imagePath && (
          <img src={fileUrl(data.imagePath)} alt={section} className="w-32 h-20 object-cover rounded-lg mb-2" />
        )}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="input-field" onChange={(e) => setImage(e.target.files[0])} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary text-sm" disabled={saving}>{saving ? "Saving..." : "Save Section"}</button>
        {saved && <span className="text-green-600 text-sm">Saved ✓</span>}
      </div>
    </form>
  );
}

export default function Settings() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    homeContentService.getAll().then((res) => setContent(res.data));
  }, []);

  const handleSectionSaved = (section, data) => {
    setContent((c) => ({ ...c, [section]: data }));
  };

  if (!content) return <Spinner label="Loading homepage content..." />;

  return (
    <div>
      <h1 className="page-title">Settings</h1>
      <p className="text-gray-500 text-sm mb-6">Edit the content displayed on the public homepage.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {Object.keys(SECTION_LABELS).map((section) => (
          <SectionEditor key={section} section={section} data={content[section]} onSaved={handleSectionSaved} />
        ))}
      </div>
    </div>
  );
}
