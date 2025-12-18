# Info on Roles

1. Admin: Can access, view and eddit everything.
2. Manager: Person who belong to a checklist department. Can only manage the checklists of their respective department.
3. moderator: Viewer for other checklists and applications where their department is not a part of.

# Application Workflow

## 1. Pre Assessment Flow

1. Titan SPOC logs via microsoft account(Validate only titan mail id)/ admin adds

2. fill in the pre assessment form

3. submit

4. Mail triggers to the SPOC who submitted pre assessment and is-assessment mail ID (isassessmentteam@titan.co.in) from suman

5. Admin validates the assessment and evaluaes whether to accept or reject with comments on why.

6. Mail triggers with evaluation status details of the assessment to SPOC.

7. Application gets created automatically based on the preaasessment responses if accepted.

## 2. Applications Flow

1. If it is submitted by pre-assessment it will have a ticket ID with respect to pre assessment submission or admin can create an application manully if neccesary.

2. Application will have checklists for **4 departments** by default assigned to the employees who belong to those respective departments with the role assigned to them as **Manager**. Say,

   - _a) IAM_
   - _b) TPRM_,
   - _c) Cloud Sec/ Security Control Integration_,
   - _d) VAPT_,
   - _e) SOC Integration_

3. Application's status will be marked based on the completion progress of checklists. The statuses are marked as follows.

   - **Pending** -> New Application without any checklist evaluation being started
   - **In-Progress** -> Applications with atleast one of the checklist evaluation had started.
   - **Completed** -> Application with all the checklists have been evaluated and accepted or marked secure.
   - **Rejected** -> Application where any of the checklist has been marked vulnerable.

4. Features:
   - Personlised priorities can be set to each application.

### Rules / Role - Access

| Action                               | Accessed by (Roles) |
| :----------------------------------- | :------------------ |
| Creating or editing a new Applicaion | admin               |
| Adding comments or notes             | admin</br> manager  |
| Viewing application status           | All                 |

## Checklists Flow

1. Each application will have checklists for **4 departments** by default assigned to the employees who belong to those respective departments. Say,

   - _a) IAM_
   - _b) TPRM_,
   - _c) Cloud Sec/ Security Control Integration_,
   - _d) VAPT_,
   - _e) SOC Integration_

2. Controls are added for each checklist by admin.

3. Response to each control in a checklist is added by the respective department personnel with evidence if neccesary.

4. Additional employees can be assinged to the checklist to be able to respond to them with the role assigned as **Moderator**.

5. Checklist's status will be marked based on the response progress of controls. The statuses are marked as follows.

   - **Pending** -> New Checklist without any control being responded.
   - **In-Progress** -> Checklist with atleast one of the control being responded.
   - **Completed** -> Checklist with all the controls have been responded and checklist marked secure.
   - **Rejected** -> Checklist where any of the control has been compromised will be marked rejected with explanation.

6. Features:
   - Personlised priorities can be set to each checklist.
   - Update application status based on the submission of checklist of corresponding apploication.
   - Can import the controls from previously added checklists.

### Rules / Role - Access

| Action                                          | Accessed by (Roles)                |
| :---------------------------------------------- | :--------------------------------- |
| Creating or editing a new checklist             | admin                              |
| Adding, removing or deleting <br> a new Control | admin</br> manager                 |
| Viewing the controls </br> and responses        | All                                |
| Responding to control                           | admin</br> manager </br> moderator |

## TODOs

- [] App wise evidence.
- [] department sections in app.
- [] users to department map.
- [] department personnel can edit. other can view.

-- Logic Changes

- [x] role level changes in application.
- [x] role level changes in application.

  -- OLD

- [] Adding notes or comments to application.
- [] (TBC []) Having approve or react to each control. (Ignore)
- [] Adding a new role as moderator to have rights to only fill responses in checklists if assigned. (Ignore)
- [] Linking managers to departments for auto assignment. (does a manager belong to many departments.)
- [] MS auto auth
