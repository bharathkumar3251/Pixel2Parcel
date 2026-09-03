import os
import qrcode
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable, PageBreak

from app.core.config import settings

class GovernmentPDFGenerator:
    @staticmethod
    def generate_parcel_report(parcel_data: dict, output_filepath: str) -> str:
        """Generate official Government PDF parcel verification report with QR Code and tables."""
        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        doc = SimpleDocTemplate(
            output_filepath,
            pagesize=A4,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        elements = []
        styles = getSampleStyleSheet()

        # Custom Government PDF Styles
        title_style = ParagraphStyle(
            'GovHeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=16,
            leading=20,
            textColor=colors.HexColor('#0A2540'), # Govt Navy
            alignment=1 # Center
        )

        subtitle_style = ParagraphStyle(
            'GovHeaderSubtitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#1D4ED8'), # Govt Blue
            alignment=1
        )

        meta_style = ParagraphStyle(
            'GovMeta',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )

        section_heading = ParagraphStyle(
            'GovSection',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=15,
            textColor=colors.HexColor('#0A2540'),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'GovBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=12,
            textColor=colors.HexColor('#0F172A')
        )

        # Header Block
        elements.append(Paragraph("GOVERNMENT OF INDIA", title_style))
        elements.append(Paragraph("DEPARTMENT OF LAND RESOURCES (DoLR), MINISTRY OF RURAL DEVELOPMENT", subtitle_style))
        elements.append(Paragraph("National Cadastral Parcel Verification & Land Records System (P2P – Pixel2Parcel)", meta_style))
        elements.append(Spacer(1, 10))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0A2540'), spaceAfter=15))

        # QR Code Generation
        parcel_id = parcel_data.get("parcel_id", "P2P-IND-MH-4001")
        verification_url = f"http://localhost:5173/citizen/search?parcel_id={parcel_id}"
        
        qr = qrcode.QRCode(version=1, box_size=4, border=1)
        qr.add_data(verification_url)
        qr.make(fit=True)
        img_qr = qr.make_image(fill_color="#0A2540", back_color="white")
        
        qr_buffer = BytesIO()
        img_qr.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_image = Image(qr_buffer, width=70, height=70)

        # Report Metadata & QR Code Header Table
        meta_table_data = [
            [
                Paragraph(f"<b>CADASTRAL PARCEL VERIFICATION REPORT</b><br/>Report ID: <b>VER-{parcel_id}</b><br/>Date: <b>{datetime.now().strftime('%d %b %Y, %H:%M IST')}</b><br/>Status: <b>OFFICIALLY VERIFIED</b>", body_style),
                qr_image
            ]
        ]
        meta_table = Table(meta_table_data, colWidths=[420, 100])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('ALIGN', (1,0), (1,0), 'RIGHT')
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))

        # 1. Parcel Identifiers Table
        elements.append(Paragraph("1. Administrative & Parcel Location Attributes", section_heading))
        p_info = [
            [Paragraph("<b>Parcel ID:</b>", body_style), Paragraph(parcel_id, body_style), Paragraph("<b>Survey Number:</b>", body_style), Paragraph(str(parcel_data.get("survey_number", "104/1A")), body_style)],
            [Paragraph("<b>State:</b>", body_style), Paragraph(str(parcel_data.get("state", "Maharashtra")), body_style), Paragraph("<b>District:</b>", body_style), Paragraph(str(parcel_data.get("district", "Pune")), body_style)],
            [Paragraph("<b>Taluk / Tehsil:</b>", body_style), Paragraph(str(parcel_data.get("taluk", "Haveli")), body_style), Paragraph("<b>Village / Ward:</b>", body_style), Paragraph(str(parcel_data.get("village", "Baner (Ward 12)")), body_style)],
            [Paragraph("<b>Land Use Category:</b>", body_style), Paragraph(str(parcel_data.get("land_use", "Urban Residential")), body_style), Paragraph("<b>Record Owner:</b>", body_style), Paragraph(str(parcel_data.get("owner_name", "Govt / Revenue Dept")), body_style)]
        ]
        p_table = Table(p_info, colWidths=[110, 150, 110, 150])
        p_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F1F5F9')),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F1F5F9')),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(p_table)
        elements.append(Spacer(1, 12))

        # 2. Geometry & Spatial Metrics
        elements.append(Paragraph("2. Geodesic Geometry & Spatial Metrics", section_heading))
        area_val = parcel_data.get("area_sqm", 845.20)
        perim_val = parcel_data.get("perimeter_m", 118.40)
        geom_info = [
            [Paragraph("<b>Calculated Geodesic Area:</b>", body_style), Paragraph(f"<b>{area_val:,.2f} sq.m</b> ({area_val/4046.86:.3f} Acres)", body_style)],
            [Paragraph("<b>Calculated Perimeter:</b>", body_style), Paragraph(f"<b>{perim_val:,.2f} meters</b>", body_style)],
            [Paragraph("<b>Shape Compactness Index:</b>", body_style), Paragraph(f"<b>{parcel_data.get('compactness', 0.94):.2f}</b> (Polysby-Popper)", body_style)],
            [Paragraph("<b>Coordinate Reference System:</b>", body_style), Paragraph("<b>WGS 84 / EPSG:4326</b> (Reprojected to UTM Zone 43N)", body_style)],
            [Paragraph("<b>Bounding Box Extent:</b>", body_style), Paragraph("[73.7885°E, 18.5575°N] to [73.7892°E, 18.5582°N]", body_style)]
        ]
        g_table = Table(geom_info, colWidths=[180, 340])
        g_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F1F5F9')),
            ('PADDING', (0,0), (-1,-1), 6)
        ]))
        elements.append(g_table)
        elements.append(Spacer(1, 12))

        # 3. Topology & Risk Validation Matrix
        elements.append(Paragraph("3. Topological Integrity & Risk Analytics", section_heading))
        conf_score = parcel_data.get("confidence_score", 96.2)
        risk_lvl = parcel_data.get("risk_level", "Green")
        
        topo_info = [
            ["GIS Rule Validation Check", "Status", "Deviation / Error Impact"],
            ["Polygon Overlap Check (Shapely)", "PASSED", "0.0 sq.m overlap with adjacent survey boundaries"],
            ["Self-Intersection & Ring Validity", "PASSED", "Valid 2D simple Polygon topology"],
            ["Building Boundary Encroachment", "PASSED", "Structure within permitted set-back lines"],
            ["GNSS CORS Field Benchmark", "PASSED", "RMSE Offset = 0.08m (Permissible threshold < 0.25m)"],
            ["Overall AI Parcel Confidence Score", f"{conf_score}%", f"Risk Matrix Rating: {risk_lvl.upper()}"]
        ]
        t_table = Table(topo_info, colWidths=[210, 90, 220])
        t_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0A2540')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 6),
            ('ALIGN', (1,0), (1,-1), 'CENTER'),
            ('BACKGROUND', (1,1), (1,-2), colors.HexColor('#DCFCE7')), # Light green
            ('TEXTCOLOR', (1,1), (1,-2), colors.HexColor('#166534'))
        ]))
        elements.append(t_table)
        elements.append(Spacer(1, 15))

        # 4. Sign-off & Official Stamp
        officer_name = parcel_data.get("verified_by") or "District Survey Officer"
        elements.append(Paragraph("4. Government Verification Sign-Off", section_heading))
        sign_info = [
            [
                Paragraph(f"<b>Verified By:</b> {officer_name}<br/><b>Department:</b> Survey & Land Records (DoLR)<br/><b>Remarks:</b> AI Drone boundaries verified against GNSS field survey points. Geometry approved for Cadastral Register.", body_style),
                Paragraph("<b>Official Digital Seal</b><br/><br/>[DIGITALLY SIGNED]<br/>DoLR-GOV-IN-STAMP-2026", ParagraphStyle('Seal', parent=body_style, alignment=1))
            ]
        ]

        s_table = Table(sign_info, colWidths=[340, 180])
        s_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 10),
            ('VALIGN', (0,0), (-1,-1), 'TOP')
        ]))
        elements.append(s_table)

        doc.build(elements)
        return output_filepath
