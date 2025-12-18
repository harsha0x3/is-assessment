| App Field        | Excel Field          | Note                    | Inputs | Extra |
| ---------------- | -------------------- | ----------------------- | ------ | ----- |
| name             | Application          | -                       |        | -     |
| provider_name    | Vendor Company       | -                       |        | -     |
| ticket_id        | mitra ticket/ pre    | -                       |        | -     |
| description      | Use Case             | -                       |        | -     |
| platform         | Environment          | -                       |        | -     |
| department       | Buisiness/ vertical  | -                       |        | -     |
| priority         | priority             | -                       |        | -     |
| status           | is assessment status | -                       |        | -     |
| \*Titan SPOC     | Titan SPOC           | TBA                     |        | -     |
| region           | not present          | IBD / Domestic          |        | -     |
| owner_name       | not present          | pre-assess sumbitter, X |        | -     |
| app_tech         | not present          | -                       |        | -     |
| infra_host       | not present          | -                       |        |       |
| \*start date     | start date           | TBA                     |
| \*end date       | end date             | TBA                     |        |
| \*Comments/Notes | overall comments     | TBA                     |
| \*\* Due date    | not present          | TBC                     |

<!--
| id            | varchar(40)          | NO   | PRI | NULL    |       |
| owner_id      | varchar(40)          | YES  | MUL | NULL    |       |
| status        | varchar(40)          | NO   |     | NULL    |       |
| creator_id    | varchar(40)          | NO   | MUL | NULL    |       |
| created_at    | datetime             | NO   |     | NULL    |       |
| updated_at    | datetime             | NO   |     | NULL    |       |
| is_active     | tinyint(1)           | NO   |     | NULL    |       |
| infra_host    | varchar(512)         | YES  |     | NULL    |       | -->

## LOGS

(server)
Administrator@EC2AMAZ-AM8ANOJ MINGW64 ~/Projects/security_assessment/server (main)
$ python dump_data.py
IN
Inserted: Campsyte
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Nymble up' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Nymble up', 'description': 'Audit the SOPs of all the stores -Digitization (Automation)', 'platform': 'GCP(Outside)', 'region': None, 'owner_name': None, 'provider_name': 'Nymble up', 'infra_host': None, 'app_tech': None, 'department': 'IBD', 'is_completed': 0, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'In-Progress', 'titan_spoc': 'kamaladass@titan.co.in', 'imitra_ticket_id': '', 'id': 'f88d7017-c88e-4e37-b4b9-55ab0cf55451', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 846494, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 846500, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Nymble up
Inserted: DEGPEG
Inserted: Intregrity Matter
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Freshworks' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Freshworks', 'description': 'Customer Complaint Live chat', 'platform': 'AWS Cloud (Outside)', 'region': None, 'owner_name': None, 'provider_name': '', 'infra_host': None, 'app_tech': None, 'department': 'Corp-HR', 'is_completed': 1, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Completed', 'titan_spoc': '', 'imitra_ticket_id': '', 'id': '711792f8-0c28-4960-91d5-adc6503eedd0', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 881131, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 881137, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Freshworks
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Mendix' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Mendix', 'description': 'Watch Service App', 'platform': 'Mendix Cloud (PAAS)', 'region': None, 'owner_name': None, 'provider_name': '', 'infra_host': None, 'app_tech': None, 'department': 'Wearbales', 'is_completed': 1, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Completed', 'titan_spoc': '', 'imitra_ticket_id': '', 'id': 'fb254e61-74f4-4f18-904d-533d09b389fe', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 888935, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 888941, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Mendix
Inserted: Nameplate Application
(Code365)
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Datahash' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Datahash', 'description': 'Using for Titan IRTH Marketing Campaign', 'platform': 'AWS(Outside)', 'region': None, 'owner_name': None, 'provider_name': '', 'infra_host': None, 'app_tech': None, 'department': 'IRTH', 'is_completed': 1, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Completed', 'titan_spoc': '', 'imitra_ticket_id': '', 'id': 'b433d59e-ab9a-43bf-82fe-0797f48996d3', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 914084, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 914090, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Datahash
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Lesconcierges Services' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Lesconcierges Services', 'description': 'Access the serives like provide restaurant recommandation, booking tickets..etc', 'platform': 'Shared Servers on Prem', 'region': None, 'owner_name': None, 'provider_name': 'Undertaking of PII and non utilization of titan email id', 'infra_host': None, 'app_tech': None, 'department': 'Corp-Admin', 'is_completed': 1, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Completed', 'titan_spoc': '', 'imitra_ticket_id': '', 'id': '8aaef64e-d5bb-454e-bcf0-3c5002824667', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 920715, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 920721, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Lesconcierges Services
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'BetterPlace' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'BetterPlace', 'description': 'Vendor employees invoices, attendance and payments tracking', 'platform': 'AWS Cloud (Outside)', 'region': None, 'owner_name': None, 'provider_name': '180 log retaintion,details of logs,SOC use cases,WAF,', 'infra_host': None, 'app_tech': None, 'department': 'CORP-HR', 'is_completed': 0, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'In-Progress', 'titan_spoc': 'senthilkumaru@titan.co.in', 'imitra_ticket_id': '', 'id': 'ad7568ce-9a85-40c7-a8c5-cd1e9671ccfe', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 936712, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 7, 936718, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: BetterPlace
Inserted: Navigation Display
Inserted: ZenDynamix
Inserted: Multilingual Project
Inserted: SalesAssist Project
Inserted: Mendix (TEAL)
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'WMS System(viniculum)' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'WMS System(viniculum)', 'description': 'Ware House Management for Eyeplus products -Purchase, Inventory, order and return managements', 'platform': 'AWS Outside', 'region': None, 'owner_name': None, 'provider_name': 'vinculumgroup', 'infra_host': None, 'app_tech': None, 'department': 'Eyeplus', 'is_completed': 0, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Not Yet Started', 'titan_spoc': 'sathishkumard@titan.co.in', 'imitra_ticket_id': 'RITM0042934', 'id': 'c9088edb-9399-4392-8535-4b3a1d710a5e', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 50528, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 50537, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: WMS System(viniculum)
Inserted: Selyek Discussion
Inserted: Bizom (Trade SO App)
Inserted: Tummoc
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Alphabake' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Alphabake', 'description': 'Virtual Try on', 'platform': '', 'region': None, 'owner_name': None, 'provider_name': 'Least count technology', 'infra_host': None, 'app_tech': None, 'department': 'Taneria', 'is_completed': 0, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Cancelled', 'titan_spoc': 'Abhirami.S@titan.co.in', 'imitra_ticket_id': '', 'id': '9469816a-75b7-49d9-928a-12432cbbfb83', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 124235, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 124240, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Alphabake
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'Alteryx One' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'Alteryx One', 'description': '', 'platform': 'AWS(Outside)', 'region': None, 'owner_name': None, 'provider_name': 'Alteryx One', 'infra_host': None, 'app_tech': None, 'department': 'IA Team', 'is_completed': 0, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Not Yet Started', 'titan_spoc': 'ashishdeshpande@titan.co.in', 'imitra_ticket_id': 'RITM0042093', 'id': 'df4a4f3a-d0b4-41e3-84aa-8f04322feb79', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 137786, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 137791, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: Alteryx One
Inserted: Medibuddy
error from contoller integrity (pymysql.err.IntegrityError) (1062, "Duplicate entry 'BHUGOL ANALYTICS' for key 'applications.name'")
[SQL: INSERT INTO applications (name, description, platform, region, owner_name, provider_name, infra_host, app_tech, department, is_completed, creator_id, owner_id, ticket_id, status, titan_spoc, imitra_ticket_id, id, created_at, updated_at, is_active) VALUES (%(name)s, %(description)s, %(platform)s, %(region)s, %(owner_name)s, %(provider_name)s, %(infra_host)s, %(app_tech)s, %(department)s, %(is_completed)s, %(creator_id)s, %(owner_id)s, %(ticket_id)s, %(status)s, %(titan_spoc)s, %(imitra_ticket_id)s, %(id)s, %(created_at)s, %(updated_at)s, %(is_active)s)]
[parameters: {'name': 'BHUGOL ANALYTICS', 'description': 'Commercial Property Rental Index provider', 'platform': 'AWS Cloud (Outside)', 'region': None, 'owner_name': None, 'provider_name': '', 'infra_host': None, 'app_tech': None, 'department': 'Retail Network Development', 'is_completed': 1, 'creator_id': 'c80ebe2b-7cb0-4776-a75c-40efbf93aa02', 'owner_id': None, 'ticket_id': None, 'status': 'Completed', 'titan_spoc': '', 'imitra_ticket_id': '', 'id': '7923f6f9-257f-4226-901d-40d171cd2c1f', 'created_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 190264, tzinfo=datetime.timezone.utc), 'updated_at': datetime.datetime(2025, 11, 21, 10, 10, 8, 190270, tzinfo=datetime.timezone.utc), 'is_active': 1}]
(Background on this error at: https://sqlalche.me/e/20/gkpj)
Skipped duplicate: BHUGOL ANALYTICS
Inserted: M/S Effigo
Inserted: In-House Digital Content Monitoring Software(CMS)
Inserted: SAP implementation services
Inserted: AI-powered marketing technology (MarTech) platform for B2C brands
Inserted: Hearing Aids
Inserted: aSMSC Phoenix
Inserted: Irame
Inserted: Nogrunt Tool
Inserted: Phone Pe
Inserted: Adobe Cloud (Titan Eye Plus & Fastrack Eyewear E-Commerce Platform)
Inserted: Minitab
Inserted: Tata InnoVista
Inserted: Icsportal
Inserted: CMS (Carrier Management System)
Inserted: Blancco Drive Eraser
Inserted: VisitHealth Insurance
Inserted: Watch running test
Inserted: MoveInSync
Inserted: Titan Track & Trace Project
Inserted: Maintenance management System
Inserted: Oracle EBS
Inserted: SAP ESM (Service cloud V2)
Inserted: Centralized BRSR data collection platform
Inserted: Cpass
Inserted: SAP
Inserted: Simpliance Vendor / TAMS
Inserted: POS Application
Inserted: MoEngage marketing solution
Inserted: DELL Storage Replication Setup/DC-DR Implementation
Inserted: VMI Application
Inserted: Product Info Management (PIM)
Inserted: SAP BOT Microsite
Inserted: Quick Metrix
Inserted: Social Listening Tool - Sprinklr
