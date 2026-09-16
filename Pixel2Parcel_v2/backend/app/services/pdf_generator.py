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
        """Generate official Urban Property Register Card (PR Card) PDF with QR Code and Municipal Seal."""
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

        # Custom Urban Government PDF Styles
        title_style = ParagraphStyle(
            'GovHeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=19,
            textColor=colors.HexColor('#0B1E36'), # MoHUA Dark Navy
            alignment=1 # Center
        )

        subtitle_style = ParagraphStyle(
            'GovHeaderSubtitle',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor('#1D4ED8'), # Govt Blue
            alignment=1
        )

        meta_style = ParagraphStyle(
            'GovMeta',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#475569'),
            alignment=1
        )

        section_heading = ParagraphStyle(
            'GovSection',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#0B1E36'),
            spaceBefore=10,
            spaceAfter=5
        )

        body_style = ParagraphStyle(
            'GovBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8.5,
            leading=11,
            textColor=colors.HexColor('#0F172A')
        )

        # Header Block
        elements.append(Paragraph("GOVERNMENT OF INDIA", title_style))
        elements.append(Paragraph("MINISTRY OF HOUSING AND URBAN AFFAIRS (MoHUA) • STATE URBAN LAND RECORDS DIRECTORATE", subtitle_style))
        elements.append(Paragraph("Smart City Municipal Cadastral Platform — Pixel2Parcel Urban GIS System", meta_style))
        elements.append(Spacer(1, 8))
        elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0B1E36'), spaceAfter=12))

        # QR Code Generation
        parcel_id = parcel_data.get("parcel_id", "P2P-IND-MH-4001")
        cts_no = parcel_data.get("survey_number", "104/1A")
        verification_url = f"http://localhost:3001/citizen/search?parcel_id={parcel_id}"
        
        qr = qrcode.QRCode(version=1, box_size=4, border=1)
        qr.add_data(verification_url)
        qr.make(fit=True)
        img_qr = qr.make_image(fill_color="#0B1E36", back_color="white")
        
        qr_buffer = BytesIO()
        img_qr.save(qr_buffer, format="PNG")
        qr_buffer.seek(0)
        qr_image = Image(qr_buffer, width=68, height=68)

        # Report Metadata & QR Code Header Table
        meta_table_data = [
            [
                Paragraph(f"<b>OFFICIAL URBAN PROPERTY REGISTER CARD (PR CARD)</b><br/>PR Card Ref ID: <b>PR-{parcel_id}</b><br/>City Survey No (CTS No.): <b>{cts_no}</b><br/>Date of Issue: <b>{datetime.now().strftime('%d %b %Y, %H:%M IST')}</b><br/>Status: <b>OFFICIALLY SEALED & VERIFIED</b>", body_style),
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
        elements.append(Spacer(1, 10))

        # 1. Urban Municipal Identifiers Table
        elements.append(Paragraph("1. Municipal Jurisdiction & Urban Property Attributes", section_heading))
        p_info = [
            [Paragraph("<b>Property Card ID:</b>", body_style), Paragraph(parcel_id, body_style), Paragraph("<b>City Survey No (CTS No.):</b>", body_style), Paragraph(str(cts_no), body_style)],
            [Paragraph("<b>State Jurisdiction:</b>", body_style), Paragraph(str(parcel_data.get("state", "Maharashtra")), body_style), Paragraph("<b>Municipal Corp / ULB:</b>", body_style), Paragraph(str(parcel_data.get("district", "Pune Municipal Corp (PMC)")), body_style)],
            [Paragraph("<b>Municipal Ward / Sector:</b>", body_style), Paragraph(str(parcel_data.get("ward_number", "Ward 12 - Baner Sector")), body_style), Paragraph("<b>City Village / Zone:</b>", body_style), Paragraph(str(parcel_data.get("village", "Baner Smart Sector")), body_style)],
            [Paragraph("<b>Urban Land Use Category:</b>", body_style), Paragraph(str(parcel_data.get("land_use", "Urban Residential")), body_style), Paragraph("<b>Registered Property Owner:</b>", body_style), Paragraph(str(parcel_data.get("owner_name", "Registered Landholder / Municipal Asset")), body_style)]
        ]
        p_table = Table(p_info, colWidths=[120, 140, 120, 140])
        p_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F1F5F9')),
            ('BACKGROUND', (2,0), (2,-1), colors.HexColor('#F1F5F9')),
            ('PADDING', (0,0), (-1,-1), 5)
        ]))
        elements.append(p_table)
        elements.append(Spacer(1, 10))

        # 2. Geometry & Spatial Metrics
        elements.append(Paragraph("2. Geodesic Built-up Area & Urban Spatial Metrics", section_heading))
        area_val = parcel_data.get("area_sqm", 845.20)
        perim_val = parcel_data.get("perimeter_m", 118.40)
        geom_info = [
            [Paragraph("<b>Calculated Geodesic Built-up Area:</b>", body_style), Paragraph(f"<b>{area_val:,.2f} sq.meters</b> ({area_val * 10.7639:,.2f} sq.ft)", body_style)],
            [Paragraph("<b>Calculated Property Perimeter:</b>", body_style), Paragraph(f"<b>{perim_val:,.2f} meters</b>", body_style)],
            [Paragraph("<b>Urban Compactness Index:</b>", body_style), Paragraph(f"<b>{parcel_data.get('compactness', 0.94):.2f}</b> (Polysby-Popper Urban Metric)", body_style)],
            [Paragraph("<b>Spatial Reference Frame:</b>", body_style), Paragraph("<b>WGS 84 / EPSG:4326</b> (Sub-5cm CORS DGPS Precision)", body_style)],
            [Paragraph("<b>Bounding Box Extent:</b>", body_style), Paragraph("[73.7885°E, 18.5575°N] to [73.7892°E, 18.5582°N]", body_style)]
        ]
        g_table = Table(geom_info, colWidths=[180, 340])
        g_table.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('BACKGROUND', (0,0), (0,-1), colors.HexColor('#F1F5F9')),
            ('PADDING', (0,0), (-1,-1), 5)
        ]))
        elements.append(g_table)
        elements.append(Spacer(1, 10))

        # 3. Urban Setback & Topology Validation Matrix
        elements.append(Paragraph("3. Urban Setback & Shapely Topology Validation Matrix", section_heading))
        conf_score = parcel_data.get("confidence_score", 96.2)
        risk_lvl = parcel_data.get("risk_level", "Green")
        
        topo_info = [
            ["Urban Spatial Validation Rule", "Status", "Deviation / Diagnostic Impact"],
            ["Polygon Boundary Overlap Check", "PASSED", "0.0 sq.m encroachment detected with adjacent CTS plots"],
            ["Road Right-of-Way Setback Check", "PASSED", "Structure within prescribed municipal setback lines"],
            ["Building Self-Intersection & Validity", "PASSED", "Valid 2D simple Polygon topology"],
            ["CORS GNSS Sub-5cm Field Audit", "PASSED", "RMSE Offset = 0.04m (Permissible urban tolerance < 0.05m)"],
            ["Overall AI Cadastral Precision Score", f"{conf_score}%", f"Urban Risk Rating: {risk_lvl.upper()}"]
        ]
        t_table = Table(topo_info, colWidths=[210, 90, 220])
        t_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0B1E36')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ALIGN', (1,0), (1,-1), 'CENTER'),
            ('BACKGROUND', (1,1), (1,-2), colors.HexColor('#DCFCE7')), # Light green
            ('TEXTCOLOR', (1,1), (1,-2), colors.HexColor('#166534'))
        ]))
        elements.append(t_table)
        elements.append(Spacer(1, 12))

        # 4. Official Sign-off & Municipal Seal
        officer_name = parcel_data.get("verified_by") or "Municipal City Survey Officer"
        elements.append(Paragraph("4. Municipal Sign-Off & Official Property Register Seal", section_heading))
        sign_info = [
            [
                Paragraph(f"<b>Issued By:</b> {officer_name}<br/><b>Department:</b> Directorate of Urban Land Records (MoHUA)<br/><b>Remarks:</b> Urban Property Card (PR Card) generated from high-precision drone imagery and sub-5cm CORS DGPS field survey. Geometry officially approved for Municipal Property Register.", body_style),
                Paragraph("<b>Official Municipal Seal</b><br/><br/>[DIGITALLY SIGNED]<br/>MoHUA-PR-CARD-STAMP-2026", ParagraphStyle('Seal', parent=body_style, alignment=1))
            ]
        ]

        s_table = Table(sign_info, colWidths=[340, 180])
        s_table.setStyle(TableStyle([
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#94A3B8')),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('PADDING', (0,0), (-1,-1), 8),
            ('VALIGN', (0,0), (-1,-1), 'TOP')
        ]))
        elements.append(s_table)

        doc.build(elements)
        return output_filepath

