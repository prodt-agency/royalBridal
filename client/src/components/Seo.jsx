import { useEffect } from "react";

function Seo({ title, description }) { useEffect(() => { document.title = title; const meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = description; }, [title, description]); return null; }

export default Seo;
