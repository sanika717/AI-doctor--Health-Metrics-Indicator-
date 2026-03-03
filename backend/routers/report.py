from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from database.mongo import get_db
from bson import ObjectId
from datetime import datetime
import io

router = APIRouter()

@router.get("/{scan_id}")
async def download_report(scan_id: str):
    db = get_db()
    try:
        doc = await db.scans.find_one({"_id": ObjectId(scan_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid ID")
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    buf = generate_pdf(doc)
    return StreamingResponse(buf, media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=health-report-{scan_id[:8]}.pdf"})

def generate_pdf(scan):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
    from reportlab.lib.enums import TA_CENTER

    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm, leftMargin=2*cm, rightMargin=2*cm)
    styles = getSampleStyleSheet()
    elems = []

    blue = colors.HexColor("#1a56db")
    navy = colors.HexColor("#0f172a")
    light = colors.HexColor("#f0f9ff")
    green = colors.HexColor("#059669")
    amber = colors.HexColor("#d97706")
    red = colors.HexColor("#dc2626")
    gray = colors.HexColor("#64748b")

    title_s = ParagraphStyle("T", fontSize=26, textColor=blue, spaceAfter=4, fontName="Helvetica-Bold", alignment=TA_CENTER)
    sub_s = ParagraphStyle("S", fontSize=11, textColor=gray, spaceAfter=2, alignment=TA_CENTER)
    info_s = ParagraphStyle("I", fontSize=10, textColor=navy)
    sec_s = ParagraphStyle("Se", fontSize=14, textColor=blue, fontName="Helvetica-Bold", spaceBefore=10, spaceAfter=6)
    rec_s = ParagraphStyle("R", fontSize=10, textColor=navy, leading=16, leftIndent=5)

    elems.append(Paragraph("AI Health Scanner", title_s))
    elems.append(Paragraph("Facial Biometric Health Assessment Report", sub_s))
    elems.append(HRFlowable(width="100%", thickness=2, color=blue))
    elems.append(Spacer(1, 0.5*cm))

    ts = scan.get("timestamp")
    ts_str = ts.strftime("%B %d, %Y at %I:%M %p UTC") if isinstance(ts, datetime) else str(ts or "N/A")
    elems.append(Paragraph(f"<b>Report ID:</b> {scan.get('id','N/A')}", info_s))
    elems.append(Paragraph(f"<b>Scan Date:</b> {ts_str}", info_s))
    elems.append(Spacer(1, 0.5*cm))

    score = scan.get("health_score", 0)
    sc = green if score >= 70 else (amber if score >= 50 else red)
    st = Table([[
        Paragraph("Overall Health Score", ParagraphStyle("x", fontSize=13, textColor=colors.white, fontName="Helvetica-Bold")),
        Paragraph(f"{score:.1f} / 100", ParagraphStyle("y", fontSize=18, textColor=colors.white, fontName="Helvetica-Bold", alignment=TA_CENTER))
    ]], colWidths=[12*cm, 5*cm])
    st.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),sc),("LEFTPADDING",(0,0),(-1,-1),14),("TOPPADDING",(0,0),(-1,-1),12),("BOTTOMPADDING",(0,0),(-1,-1),12),("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
    elems.append(st)
    elems.append(Spacer(1, 0.5*cm))

    hr = scan.get("heart_rate", 0)
    hr_s = "Normal" if 60 <= hr <= 100 else ("Elevated" if hr > 100 else "Low")
    hr_c = green if hr_s == "Normal" else red

    elems.append(Paragraph("Heart Health Indicators", sec_s))
    ht = Table([["Metric","Value","Unit","Status"],["Heart Rate",f"{hr:.0f}","bpm",hr_s],["Confidence",f"{scan.get('confidence',0):.1f}","%","Measured"]], colWidths=[6*cm,3.5*cm,3*cm,4.5*cm])
    ht.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),10),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,light]),("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#e2e8f0")),("LEFTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),("TEXTCOLOR",(3,1),(3,1),hr_c),("FONTNAME",(3,1),(3,1),"Helvetica-Bold")]))
    elems.append(ht)
    elems.append(Spacer(1, 0.4*cm))

    stress = scan.get("stress", 0)
    fatigue = scan.get("fatigue", 0)
    bf = scan.get("blood_flow","Normal")

    def lvl(v): return ("Low",green) if v < 35 else (("Moderate",amber) if v < 65 else ("High",red))
    sl, sc2 = lvl(stress); fl, fc = lvl(fatigue)

    elems.append(Paragraph("Health Metrics", sec_s))
    mt = Table([["Metric","Value","Unit","Status"],["Stress Level",f"{stress:.1f}","%",sl],["Fatigue Level",f"{fatigue:.1f}","%",fl],["Blood Flow",bf,"—",bf]], colWidths=[6*cm,3.5*cm,3*cm,4.5*cm])
    mt.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),blue),("TEXTCOLOR",(0,0),(-1,0),colors.white),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("FONTSIZE",(0,0),(-1,-1),10),("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white,light]),("GRID",(0,0),(-1,-1),0.5,colors.HexColor("#e2e8f0")),("LEFTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8),("TEXTCOLOR",(3,1),(3,1),sc2),("FONTNAME",(3,1),(3,1),"Helvetica-Bold"),("TEXTCOLOR",(3,2),(3,2),fc),("FONTNAME",(3,2),(3,2),"Helvetica-Bold")]))
    elems.append(mt)
    elems.append(Spacer(1, 0.6*cm))

    elems.append(Paragraph("Recommendations", sec_s))
    recs = []
    if hr > 100: recs.append("• Elevated heart rate. Consult a cardiologist.")
    elif hr < 60: recs.append("• Low heart rate. Consult a physician.")
    else: recs.append("• Heart rate is normal. Maintain cardiovascular exercise.")
    if stress > 60: recs.append("• High stress detected. Practice mindfulness and rest.")
    if fatigue > 60: recs.append("• High fatigue. Ensure 7–9 hours quality sleep.")
    if bf.lower() in ["poor","slightly reduced"]: recs.append("• Reduced blood flow. Consider cardiovascular checkup.")
    recs.append("• This report is AI-based. Always consult a qualified physician.")
    for r in recs:
        elems.append(Paragraph(r, rec_s))

    elems.append(Spacer(1, 0.6*cm))
    elems.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e2e8f0")))
    elems.append(Spacer(1, 0.3*cm))
    disc = ParagraphStyle("D", fontSize=8, textColor=gray, alignment=TA_CENTER, fontName="Helvetica-Oblique")
    elems.append(Paragraph("DISCLAIMER: For informational purposes only. Not medical advice.", disc))
    elems.append(Paragraph("Generated by AI Health Scanner © 2026", disc))

    doc.build(elems)
    buf.seek(0)
    return buf
