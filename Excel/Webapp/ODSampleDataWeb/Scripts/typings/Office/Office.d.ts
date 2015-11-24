declare module Office {

    /** Specifies the result of an asynchronous call. */
    export enum AsyncResultStatus {
        /** The call succeeded. */
        Succeeded,
        /** The call failed. */
        Failed
    }
}
declare module Office {

    /** Specifies an attachment's type. */
    export enum AttachmentType {
        /** The attachment is a file. */
        File,
        /** The attachment is an Exchange item. */
        Item
    }
}
declare module Office {

    /** Specifies the type of the binding object that should be returned. */
    export enum BindingType {
        /** Tabular data without a header row. Data is returned as an array of arrays, for example in this form: [[row1column1, row1column2],[row2column1, row2column2]] */
        Matrix,
        /** Tabular data with a header row. Data is returned as a TableData object. */
        Table,
        /** Plain text. Data is returned as a run of characters. */
        Text
    }
}
declare module Office {

    /** Specifies how to coerce data returned or set by the invoked method. */
    export enum CoercionType {
        /** Return or set data as HTML. */
        Html,
        /** Return or set data as tabular data with no headers.
            Data is returned or set as an array of arrays containing one-dimensional runs of characters. For example, three rows of string values in two columns would be: [["R1C1", "R1C2"], ["R2C1", "R2C2"], ["R3C1", "R3C2"]].
         */
        Matrix,
        /** Return or set data as Office Open XML. */
        Ooxml,
        /** Return or set data as tabular data with optional headers.
            Data is returned or set as an array of arrays with optional headers. */
        Table,
        /** Return or set data as text (string).
            Data is returned or set as a one-dimensional run of characters. */
        Text
    }
}
declare module Office {
    export enum GoToType {
        Binding,
        NamedItem,
        Slide,
        Index
    }
}
declare module Office {

    /** Specifies the node type. */
    export enum CustomXMLNodeType {

        /** Return formatted data. */
        Attribute,

        /** The node is a CData type. */
        CData,

        /** The node is a comment. */
        NodeComment,

        /** The node is an element. */
        Element,

        /** The node is a Document element.. */
        NodeDocument,

        /** The node is a processing instruction.. */
        ProcessingInstruction,

        /** The node is a text node. */
        Text
    }
}
declare module Office {

    /** Specifies whether the document in associated application is read-only or read-write. */
    export enum DocumentMode {
        /** The document is read-only.*/
        ReadOnly,
        /** The document can be read and written to. */
        ReadWrite
    }
}
declare module Office {

    /** Specifies an entity's type. */
    export enum EntityType {
        /** Specifies that the entity is a postal address. */
        Address,
        /** Specifies that the entity is a contact. */
        Contact,
        /** Specifies that the entity is SMTP email address. */
        EmailAddress,
        /** Specifies that the entity is a meeting suggestion. */
        MeetingSuggestion,
        /** Specifies that the entity is US phone number. */
        PhoneNumber,
        /** Specifies that the entity is a task suggestion. */
        TaskSuggestion,
        /** Specifies that the entity is an Internet URL. */
        URL
    }
}
declare module Office {

    /** Specifies the kind of event that was raised. Returned by the type property of an EventNameEventArgs object. */
    export enum EventType {
        /** A Document.SelectionChanged event was raised. */
        DocumentSelectionChanged,
        /** A Document.SelectionChanged event was raised. */
        BindingSelectionChanged,
        /** A Document.BindingDataChanged event was raised. */
        BindingDataChanged,
        /** A Document.NodeDeleted event was raised. */
        NodeDeleted,
        /** A Document.NodeInserted event was raised. */
        NodeInserted,
        /** A Document.NodeReplaced event was raised. */
        NodeReplaced,
        /** A Document.SettingsChanged event was raised. */
        SettingsChanged
    }
}
declare module Office {

    /** Specifies the format in which to return the document. */
    export enum FileType {
        /** Returns the entire document (.pptx or .docx) in Office Open XML (OOXML) format as a byte array. */
        Compressed,
        /** Returns only the text of the document as a string. (Word only) */
        Text
    }
}
declare module Office {

    /** Specifies whether filtering from the host application is applied when the data is retrieved. */
    export enum FilterType {
        /** Return all data (not filtered by the host application). */
        All,
        /** Return only the visible data (as filtered by the host application). */
        OnlyVisible
    }
}
declare module Office {

    /** Specifies whether the app was just inserted or was already contained in the document. */
    export enum InitializationReason {
        /** The appwas just inserted into the document. */
        Inserted,
        /** The appis already part of the document that was opened. */
        DocumentOpened
    }
}
declare module Office {

    /** Specifies an item's type. */
    export enum ItemClass {
        /** Specifies an appointment item. This is an IPM.Appointment type. */
        //static Message: string;
        /** A meeting request, response, or cancellation. This corresponds to the following message classes in Outlook:
            IPM.Schedule.Meeting.Request
            IPM.Schedule.Meeting.Neg
            IPM.Schedule.Meeting.Pos
            IPM.Schedule.Meeting.Tent
            IPM.Schedule.Meeting.Canceled */
        //static Appointment: string;
    }
}
declare module Office {

    export module MailboxEnums {

        /** Specifies an item's type. */
        export enum ItemType {
            /** Specifies an appointment item. This is an IPM.Appointment type. */
            Message,
            /** A meeting request, response, or cancellation. This corresponds to the following message classes in Outlook:
                IPM.Schedule.Meeting.Request
                IPM.Schedule.Meeting.Neg
                IPM.Schedule.Meeting.Pos
                IPM.Schedule.Meeting.Tent
                IPM.Schedule.Meeting.Canceled */
            Appointment
        }
    }
}declare module Office {
    /** Specifies the project fields that are available as a parameter for the getProjectFieldAsync method. */
    export enum ProjectProjectFields {
        /** The number of digits after the decimal for the currency. */
        CurrencyDigits = 0,
        /** The currency symbol. */
        CurrencySymbol = 1,
        /** The placement of the currency symbol. For possible values, see the CurrencySymbolPosition enumeration in the Project 2013 SDK. For example, a returned value of 0 means the currency symbol is placed before the cost, with no space ($0). */
        CurrencySymbolPosition = 2,
        /** The GUID of the project. */
        GUID = 3,
        /** The project finish date. */
        Finish = 4,
        /** The project start date. */
        Start = 5,
        /** Specifies whether the project is read-only. */
        ReadOnly = 7,
        /** The project version. */
        VERSION = 8,
        /** The work units of the project, such as days or hours. */
        WorkUnits = 9,
        /** The Project Web App URL, for projects that are stored in Project Server. */
        ProjectServerUrl = 10,
        /** The SharePoint URL, for projects that are synchronized with a SharePoint list. */
        WSSUrl = 11,
        /** The name of the SharePoint list, for projects that are synchronized with a tasks list. */
        WSSList = 12
    }
}declare module Office {
    /** Specifies the resource fields that are available as a parameter for the getResourceFieldAsync method. */
    export enum ProjectResourceFields {
        Accrual = 0,
        /** The calculated actual cost of the resource for assignments in the project. */
        ActualCost = 1,
        ActualOvertimeCost = 2,
        ActualOvertimeWork = 3,
        ActualOvertimeWorkProtected = 4,
        /** The actual work that the resource has done on assignments in the project. */
        ActualWork = 5,
        ActualWorkProtected = 6,
        BaseCalendar = 7,
        Baseline10BudgetCost = 8,
        Baseline10BudgetWork = 9,
        Baseline10Cost = 10,
        Baseline10Work = 11,
        Baseline1BudgetCost = 12,
        Baseline1BudgetWork = 13,
        Baseline1Cost = 14,
        Baseline1Work = 15,
        Baseline2BudgetCost = 16,
        Baseline2BudgetWork = 17,
        Baseline2Cost = 18,
        Baseline2Work = 19,
        Baseline3BudgetCost = 20,
        Baseline3BudgetWork = 21,
        Baseline3Cost = 22,
        Baseline3Work = 23,
        Baseline4BudgetCost = 24,
        Baseline4BudgetWork = 25,
        Baseline4Cost = 26,
        Baseline4Work = 27,
        Baseline5BudgetCost = 28,
        Baseline5BudgetWork = 29,
        Baseline5Cost = 30,
        Baseline5Work = 31,
        Baseline6BudgetCost = 32,
        Baseline6BudgetWork = 33,
        Baseline6Cost = 34,
        Baseline6Work = 35,
        Baseline7BudgetCost = 36,
        Baseline7BudgetWork = 37,
        Baseline7Cost = 38,
        Baseline7Work = 39,
        Baseline8BudgetCost = 40,
        Baseline8BudgetWork = 41,
        Baseline8Cost = 42,
        Baseline8Work = 43,
        Baseline9BudgetCost = 44,
        Baseline9BudgetWork = 45,
        Baseline9Cost = 46,
        Baseline9Work = 47,
        BaselineBudgetCost = 48,
        BaselineBudgetWork = 49,
        /** The baseline cost for the resource, for assignments in the project. */
        BaselineCost = 50,
        BaselineWork = 51,
        BudgetCost = 52,
        BudgetWork = 53,
        ResourceCalendarGUID = 54,
        Code = 55,
        Cost1 = 56,
        Cost10 = 57,
        Cost2 = 58,
        Cost3 = 59,
        Cost4 = 60,
        Cost5 = 61,
        Cost6 = 62,
        Cost7 = 63,
        Cost8 = 64,
        Cost9 = 65,
        ResourceCreationDate = 66,
        Date1 = 67,
        Date10 = 68,
        Date2 = 69,
        Date3 = 70,
        Date4 = 71,
        Date5 = 72,
        Date6 = 73,
        Date7 = 74,
        Date8 = 75,
        Date9 = 76,
        Duration1 = 77,
        Duration10 = 78,
        Duration2 = 79,
        Duration3 = 80,
        Duration4 = 81,
        Duration5 = 82,
        Duration6 = 83,
        Duration7 = 84,
        Duration8 = 85,
        Duration9 = 86,
        Email = 87,
        End = 88,
        Finish1 = 89,
        Finish10 = 90,
        Finish2 = 91,
        Finish3 = 92,
        Finish4 = 93,
        Finish5 = 94,
        Finish6 = 95,
        Finish7 = 96,
        Finish8 = 97,
        Finish9 = 98,
        Flag10 = 99,
        Flag1 = 100,
        Flag11 = 101,
        Flag12 = 102,
        Flag13 = 103,
        Flag14 = 104,
        Flag15 = 105,
        Flag16 = 106,
        Flag17 = 107,
        Flag18 = 108,
        Flag19 = 109,
        Flag2 = 110,
        Flag20 = 111,
        Flag3 = 112,
        Flag4 = 113,
        Flag5 = 114,
        Flag6 = 115,
        Flag7 = 116,
        Flag8 = 117,
        Flag9 = 118,
        Group = 119,
        /** The percentage of work units that the resource is assigned in the project If the resource is working full-time on the project, Units  = 100. */
        Units = 120,
        /** The name of the resource. */
        Name = 121,
        Notes = 122,
        Number1 = 123,
        Number10 = 124,
        Number11 = 125,
        Number12 = 126,
        Number13 = 127,
        Number14 = 128,
        Number15 = 129,
        Number16 = 130,
        Number17 = 131,
        Number18 = 132,
        Number19 = 133,
        Number2 = 134,
        Number20 = 135,
        Number3 = 136,
        Number4 = 137,
        Number5 = 138,
        Number6 = 139,
        Number7 = 140,
        Number8 = 141,
        Number9 = 142,
        OvertimeCost = 143,
        OvertimeRate = 144,
        OvertimeWork = 145,
        PercentWorkComplete = 146,
        CostPerUse = 147,
        Generic = 148,
        OverAllocated = 149,
        RegularWork = 150,
        RemainingCost = 151,
        RemainingOvertimeCost = 152,
        RemainingOvertimeWork = 153,
        RemainingWork = 154,
        /** The GUID of the enterprise resource, for a project that is stored in Project Server. */
        ResourceGUID = 155,
        /** The calculated cost of the resource for assignments in the project. */
        Cost = 156,
        Work = 157,
        Start = 158,
        Start1 = 159,
        Start10 = 160,
        Start2 = 161,
        Start3 = 162,
        Start4 = 163,
        Start5 = 164,
        Start6 = 165,
        Start7 = 166,
        Start8 = 167,
        Start9 = 168,
        /** The standard rate of pay for the resource, in cost per hour. */
        StandardRate = 169,
        /** The value of the local Text1 custom field for the resource. */
        Text1 = 170,
        Text10 = 171,
        Text11 = 172,
        Text12 = 173,
        Text13 = 174,
        Text14 = 175,
        Text15 = 176,
        Text16 = 177,
        Text17 = 178,
        Text18 = 179,
        Text19 = 180,
        Text2 = 181,
        Text20 = 182,
        Text21 = 183,
        Text22 = 184,
        Text23 = 185,
        Text24 = 186,
        Text25 = 187,
        Text26 = 188,
        Text27 = 189,
        Text28 = 190,
        Text29 = 191,
        Text3 = 192,
        Text30 = 193,
        Text4 = 194,
        Text5 = 195,
        Text6 = 196,
        Text7 = 197,
        Text8 = 198,
        Text9 = 199
    }
}declare module Office {
    /** Specifies the task fields that are available as a parameter for the getTaskFieldAsync method. */
    export enum ProjectTaskFields {
        ActualCost = 0,
        ActualDuration = 1,
        ActualFinish = 2,
        ActualOvertimeCost = 3,
        ActualOvertimeWork = 4,
        ActualStart = 5,
        ActualWork = 6,
        /** The value of the local Text1 custom field for the task. */
        Text1 = 7,
        Text10 = 8,
        Finish10 = 9,
        Start10 = 10,
        Text11 = 11,
        Text12 = 12,
        Text13 = 13,
        Text14 = 14,
        Text15 = 15,
        Text16 = 16,
        Text17 = 17,
        Text18 = 18,
        Text19 = 19,
        Finish1 = 20,
        Start1 = 21,
        Text2 = 22,
        Text20 = 23,
        Text21 = 24,
        Text22 = 25,
        Text23 = 26,
        Text24 = 27,
        Text25 = 28,
        Text26 = 29,
        Text27 = 30,
        Text28 = 31,
        Text29 = 32,
        Finish2 = 33,
        Start2 = 34,
        Text3 = 35,
        Text30 = 36,
        Finish3 = 37,
        Start3 = 38,
        Text4 = 39,
        Finish4 = 40,
        Start4 = 41,
        Text5 = 42,
        Finish5 = 43,
        Start5 = 44,
        Text6 = 45,
        Finish6 = 46,
        Start6 = 47,
        Text7 = 48,
        Finish7 = 49,
        Start7 = 50,
        Text8 = 51,
        Finish8 = 52,
        Start8 = 53,
        Text9 = 54,
        Finish9 = 55,
        Start9 = 56,
        Baseline10BudgetCost = 57,
        Baseline10BudgetWork = 58,
        Baseline10Cost = 59,
        Baseline10Duration = 60,
        Baseline10Finish = 61,
        Baseline10FixedCost = 62,
        Baseline10FixedCostAccrual = 63,
        Baseline10Start = 64,
        Baseline10Work = 65,
        Baseline1BudgetCost = 66,
        Baseline1BudgetWork = 67,
        Baseline1Cost = 68,
        Baseline1Duration = 69,
        Baseline1Finish = 70,
        Baseline1FixedCost = 71,
        Baseline1FixedCostAccrual = 72,
        Baseline1Start = 73,
        Baseline1Work = 74,
        Baseline2BudgetCost = 75,
        Baseline2BudgetWork = 76,
        Baseline2Cost = 77,
        Baseline2Duration = 78,
        Baseline2Finish = 79,
        Baseline2FixedCost = 80,
        Baseline2FixedCostAccrual = 81,
        Baseline2Start = 82,
        Baseline2Work = 83,
        Baseline3BudgetCost = 84,
        Baseline3BudgetWork = 85,
        Baseline3Cost = 86,
        Baseline3Duration = 87,
        Baseline3Finish = 88,
        Baseline3FixedCost = 89,
        Baseline3FixedCostAccrual = 90,
        Basline3Start = 91,
        Baseline3Work = 92,
        Baseline4BudgetCost = 93,
        Baseline4BudgetWork = 94,
        Baseline4Cost = 95,
        Baseline4Duration = 96,
        Baseline4Finish = 97,
        Baseline4FixedCost = 98,
        Baseline4FixedCostAccrual = 99,
        Baseline4Start = 100,
        Baseline4Work = 101,
        Baseline5BudgetCost = 102,
        Baseline5BudgetWork = 103,
        Baseline5Cost = 104,
        Baseline5Duration = 105,
        Baseline5Finish = 106,
        Baseline5FixedCost = 107,
        Baseline5FixedCostAccrual = 108,
        Baseline5Start = 109,
        Baseline5Work = 110,
        Baseline6BudgetCost = 111,
        Baseline6BudgetWork = 112,
        Baseline6Cost = 113,
        Baseline6Duration = 114,
        Baseline6Finish = 115,
        Baseline6FixedCost = 116,
        Baseline6FixedCostAccrual = 117,
        Baseline6Start = 118,
        Baseline6Work = 119,
        Baseline7BudgetCost = 120,
        Baseline7BudgetWork = 121,
        Baseline7Cost = 122,
        Baseline7Duration = 123,
        Baseline7Finish = 124,
        Baseline7FixedCost = 125,
        Baseline7FixedCostAccrual = 126,
        Baseline7Start = 127,
        Baseline7Work = 128,
        Baseline8BudgetCost = 129,
        Baseline8BudgetWork = 130,
        Baseline8Cost = 131,
        Baseline8Duration = 132,
        Baseline8Finish = 133,
        Baseline8FixedCost = 134,
        Baseline8FixedCostAccrual = 135,
        Baseline8Start = 136,
        Baseline8Work = 137,
        Baseline9BudgetCost = 138,
        Baseline9BudgetWork = 139,
        Baseline9Cost = 140,
        Baseline9Duration = 141,
        Baseline9Finish = 142,
        Baseline9FixedCost = 143,
        Baseline9FixedCostAccrual = 144,
        Baseline9Start = 145,
        Baseline9Work = 146,
        BaselineBudgetCost = 147,
        BaselineBudgetWork = 148,
        /** The baseline cost for a task. */
        BaselineCost = 149,
        BaselineDuration = 150,
        BaselineFinish = 151,
        BaselineFixedCost = 152,
        BaselineFixedCostAccrual = 153,
        BaselineStart = 154,
        BaselineWork = 155,
        BudgetCost = 156,
        BudgetWork = 157,
        TaskCalendarGUID = 158,
        ConstraintDate = 159,
        ConstraintType = 160,
        Cost1 = 161,
        Cost10 = 162,
        Cost2 = 163,
        Cost3 = 164,
        Cost4 = 165,
        Cost5 = 166,
        Cost6 = 167,
        Cost7 = 168,
        Cost8 = 169,
        Cost9 = 170,
        Date1 = 171,
        Date10 = 172,
        Date2 = 173,
        Date3 = 174,
        Date4 = 175,
        Date5 = 176,
        Date6 = 177,
        Date7 = 178,
        Date8 = 179,
        Date9 = 180,
        Deadline = 181,
        Duration1 = 182,
        Duration10 = 183,
        Duration2 = 184,
        Duration3 = 185,
        Duration4 = 186,
        Duration5 = 187,
        Duration6 = 188,
        Duration7 = 189,
        Duration8 = 190,
        Duration9 = 191,
        /** The task duration, for example 2d means two days. */
        Duration = 192,
        EarnedValueMethod = 193,
        FinishSlack = 194,
        FixedCost = 195,
        FixedCostAccrual = 196,
        Flag10 = 197,
        Flag1 = 198,
        Flag11 = 199,
        Flag12 = 200,
        Flag13 = 201,
        Flag14 = 202,
        Flag15 = 203,
        Flag16 = 204,
        Flag17 = 205,
        Flag18 = 206,
        Flag19 = 207,
        Flag2 = 208,
        Flag20 = 209,
        Flag3 = 210,
        Flag4 = 211,
        Flag5 = 212,
        Flag6 = 213,
        Flag7 = 214,
        Flag8 = 215,
        Flag9 = 216,
        FreeSlack = 217,
        HasRollupSubTasks = 218,
        /** The index of the selected task. After the project summary task, the index of the first task in a project is 1. */
        ID = 219,
        /** The name of the task. */
        Name = 220,
        /** The text value of the task notes. */
        Notes = 221,
        Number1 = 222,
        Number10 = 223,
        Number11 = 224,
        Number12 = 225,
        Number13 = 226,
        Number14 = 227,
        Number15 = 228,
        Number16 = 229,
        Number17 = 230,
        Number18 = 231,
        Number19 = 232,
        Number2 = 233,
        Number20 = 234,
        Number3 = 235,
        Number4 = 236,
        Number5 = 237,
        Number6 = 238,
        Number7 = 239,
        Number8 = 240,
        Number9 = 241,
        ScheduledDuration = 242,
        ScheduledFinish = 243,
        ScheduledStart = 244,
        OutlineLevel = 245,
        OvertimeCost = 246,
        OvertimeWork = 247,
        PercentComplete = 248,
        PercentWorkComplete = 249,
        Predecessors = 250,
        PreleveledFinish = 251,
        PreleveledStart = 252,
        /** The priority of the task, with values from 0 (low) to 1000 (high). The default priority value is 500. */
        Priority = 253,
        Active = 254,
        Critical = 255,
        /** Indicates whether the task is a milestone. */
        Milestone = 256,
        Overallocated = 257,
        IsRollup = 258,
        /** Indicates whether the task is a summary task. */
        Summary = 259,
        RegularWork = 260,
        RemainingCost = 261,
        RemainingDuration = 262,
        RemainingOvertimeCost = 263,
        RemainingWork = 264,
        ResourceNames = 265,
       // ResourceNames = 266,
        Cost = 267,
        /** The task finish date. */
        Finish = 268,
        /** The task start date. */
        Start = 269,
        Work = 270,
        StartSlack = 271,
        Status = 272,
        Successors = 273,
        StatusManager = 274,
        TotalSlack = 275,
        /** The GUID of the task, for a project that is stored in Project Server. */
        TaskGUID = 276,
        /** Specifies the way the task is calculated; that is, which one of units, duration, or work are fixed. */
        Type = 277,
        WBS = 278,
        WBSPREDECESSORS = 279,
        WBSSUCCESSORS = 280,
        /** The identification number of the task in a SharePoint list, for a project that is synchronized with a SharePoint tasks list. */
        WSSID = 281
    }
}declare module Office {
    /** Specifies the types of views that the getSelectedViewAsync method can recognize. */
    export enum ProjectViewTypes {
        /** The Gantt chart view. */
        Gantt = 1,
        /** The Network Diagram view. */
        NetworkDiagram = 2,
        /** The Task Diagram view. */
        TaskDiagram = 3,
        /** The Task form view. */
        TaskForm = 4,
        /** The Task Sheet view. */
        TaskSheet = 5,
        /** The Resource Form view. */
        ResourceForm = 6,
        /** The Resource Sheet view. */
        ResourceSheet = 7,
        /** The Resource Graph view. */
        ResourceGraph = 8,
        /** The Team Planner view. */
        TeamPlanner = 9,
        /** The Task Details view. */
        TaskDetails = 10,
        /** The Task Name Form view. */
        TaskNameForm = 11,
        /** The Resource Names view. */
        ResourceNames = 12,
        /** The Calendar view. */
        Calendar = 13,
        /** The Task Usage view. */
        TaskUsage = 14,
        /** The Resource Usage view. */
        ResourceUsage = 15,
        /** The Timeline view. */
        Timeline = 16
    }
}
declare module Office {

    /** Specifies the type of recipient for an appointment. */
    export enum RecipientType {

        /** Specifies that the recipient is a distribution list containing a list of email addresses. */
        DistributionList,

        /** Specifies that the recipient is an SMTP email address that is not on the Exchange server. */
        ExternalUser,

        /** Specifies that the recipient is not one of the other recipient types. */
        Other,

        /** Specifies that the recipient is an SMTP email address that is on the Exchange server. */
        User
    }
}
declare module Office {

    /** Specifies the type of recipient for an appointment. */
    export enum ResponseType {
        /** The meeting request was accepted by the attendee. */
        Accepted,

        /** The meeting request was declined by the attendee. */
        Declined,

        /** There has been no response from the attendee. */
        None,

        /** The attendee is the meeting organizer. */
        Organizer,

        /** The meeting request was tentatively accepted by the attendee. */
        Tentative
    }
}
declare module Office {

    /** Specifies whether values, such as numbers and dates, returned by the invoked method are returned with their formatting applied. */
    export enum ValueFormat {
        /** Return formatted data. */
        Formatted,

        /** Return unformatted data. */
        Unformatted
    }
}
declare module Office {

    /** Represents an appointment item from the server. */
    export class Appointment extends Item {

        /** Gets an array of attachments for the appointment. */
        attachments: AttachmentDetails[];

        /** Gets the date and time that the appointment is to end. */
        end: Date;

        /** Gets the location of an appointment. */
        location: string;

        /** Gets the subject of an appointment, with all prefixes removed (including �RE:� and �FWD:�). */
        normalizedSubject: string;

        /** Gets a list email addresses for optional attendees. */
        optionalAttendees: EmailAddressDetails[];

        /** Gets the email address of the meeting organizer for a specified meeting. */
        organizer: EmailAddressDetails;

        /** Gets a list of email addresses for required attendees. */
        requiredAttendees: EmailAddressDetails[];

        /** Gets the resources required for an appointment. */
        resources: any;

        /** Gets the date and time that the appointment is to begin. */
        start: Date;

        /** Gets the subject of an appointment. */
        subject: string;

        /** Gets an array of entities found in an appointment. */
        getEntities(): Entities;

        /** Gets an array of entities of the specified entity type found in an appointment. */
        getEntitiesByType(): EntityType;

        /** Returns well-known entities that pass the named filter defined in the manifest XML file. */
        getFilteredEntitiesByName(name: string): Entities;

        /** Returns string values in the currently selected appointment object that match the regular expressions defined in the manifest XML file. */
        getRegExMatches(): Entities;

        /** Returns string values that match the named regular expression defined in the manifest XML file. */
        getRegExMatchesByName(name: string): Entities;
    }
}
declare module Office {

    /** An object which encapsulates the result of an asynchronous request, including status and error information if the request failed. */
    export class AsyncResult {

        /** Gets the user-defined item passed to the optional asyncContext parameter of the invoked method in the same state as it was passed in. */
        asyncContext: any;
        /** Gets an Error object that provides a description of the error, if any error occurred. */
        error: Office.Error;
        /** Gets the status of the asynchronous operation. */
        status: Office.AsyncResultStatus;
        /** Gets the payload or content of this asynchronous operation, if any. */
        value: any;
    }

}
declare module Office {

    /** Represents an attachment on an item from the server. */
    export class AttachmentDetails {

        /** Gets one of the AttachmentType enumeration values that indicates whether the attachment is an Exchange item or a file. */
        attachmentType: any;

        /** Gets the MIME content type of the attachment. */
        contentType: string;

        /** Gets the Exchange attachment ID of the attachment. */
        id: string;

        /** Gets a value that indicates whether the attachment is an inline attachment. */
        isInline: boolean;

        /** Gets the name of the attachment. */
        name: string;

        /** Gets the size of the attachment in bytes. */
        size: number;
    }
}
declare module Office {

    /** An abstract class that represents a binding to a section of the document. */
    export class Binding {

        /** Get the Document object associated with the binding. */
        document: Document;

        /** Gets the identifier of the object. */
        id: string;

        /** Gets the type of the binding. */
        type: BindingType;

        /** Adds a handler to the binding for the specified event type. */
        addHandlerAsync(eventType: EventType, handler: any, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void): void;

        /** Returns the data contained within the binding. */
        getDataAsync(options?: { coercionType?: CoercionType; valueFormat?: ValueFormat; filterType?: FilterType; startRow?: number; startColumn?: number; rowCount?: number; columnCount?: number; asyncContext?: any; }, callback?: (result: AsyncResult) => void): void;
        getDataAsync(callback: (result: AsyncResult) => void): void;

        /** Removes the specified handler from the binding for the specified event type. */
        removeHandlerAsync(eventType: EventType, options?: { handler?: any; asyncContext?: any; }, callback?: (result: AsyncResult) => void): void;

        /** Writes data to the bound section of the document represented by the specified binding object. */
        setDataAsync(options?: { coercionType?: CoercionType; startRow: number; startColumn: number; asyncContext?: any; }, callback?: (result: AsyncResult) => void): void;

    }
}
declare module Office {

    /** Represents the bindings the app has within the document. */
    export class Bindings {

        /** Gets a Document object that represents the document associated with this set of bindings. */
        document: Document;

        /** Adds a binding to a named item in the document. */
        addFromNamedItemAsync(itemName: string, bindingType: BindingType, options?: { id?: string; asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Displays UI that enables the user to specify a selection to bind to. */
        addFromPromptAsync(bindingType: BindingType, options?: { id?: string; promptText?: string; asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Adds a binding to the current selection in the document. */
        addFromSelectionAsync(bindingType: BindingType, options?: { id?: string; asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Gets all bindings that were previously created. */
        getAllAsync(options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Gets the specified binding by its identifier. */
        getByIdAsync(id: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Removes the specified binding. */
        releaseByIdAsync(id: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);
    }
}

declare module Office {

    /** Represents a contact stored on the server. */
    export class Contact {

        /** Gets the mailing and street addresses associated with a contact. */
        addresses: string[];

        /** Gets the name of the business associated with a contact. */
        businessName: string;

        /** Gets the SMTP email addresses associated with the contact. */
        emailAddresses: string[];

        /** Gets the name of the person associated with a contact. */
        personName: string;

        /** Gets the phone numbers associated with a contact. */
        phoneNumbers: PhoneNumber[];

        /** Gets a list of Internet URLs associated with a contact. */
        urls: string[];
    }
}

declare module Office {

    /** Represents the runtime environment of the app and provides access to key objects of the API. */
    export class Context {

        /** Gets the locale (language) for data as it is stored in the document or item. */
        contentLanguage: string;
        /** Gets the locale (language) for the UI of the hosting application. */
        displayLanguage: string;
        /** Gets an object that represents the document the content or task pane app is interacting with. */
        document: Office.Document;
        /** Gets an object that represents the project document the content or task pane app is interacting with. */
        projectDocument: Office.ProjectDocument;
        /** Gets the mailbox object that provides access to members of the API that are specifically for mail apps. */
        mailbox: Office.Mailbox;
        /** Gets an object that represents the saved custom settings of the app. */
        roamingSettings: Office.RoamingSettings;
    }
}

declare module Office {

    /** Provides a collection of item-specific custom properties. */
    export class CustomProperties {

        /** Returns the value of the specified custom property. */
        get(name: string): string;

        /** Removes the specified property from the custom property collection. */
        remove(name: string);

        /** Saves item-specific custom properties to the Exchange Server 2013. */
        saveAsync(callback?: any, userContext?: any);

        /** Sets the specified property to the specified value. */
        set(name: string, value: string);
    }
}
declare module Office {

    /** Represents an XML node in a tree in a document. */
    export class CustomXmlNode {

        /** Gets the base name of the node without the namespace prefix, if one exists. */
        baseName: string;

        /** Gets the type of the CustomXMLNode. */
        nodeType: CustomXMLNodeType;

        /** Retrieves the string GUID of the CustomXMLPart. */
        namespaceUri: string;

        /** Gets the nodes as an array of CustomXMLNode objects matching the relative XPath expression. */
        getNodesAsync(xPath: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets the value of the node. */
        getNodeValueAsync(options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets the XML of the node. */
        getXmlAsync(options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously sets the value of the node. */
        setNodeValueAsync(value: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Sets the XML of the node. */
        setXmlAsync(xml: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);
    }
}
declare module Office {

    /** Represents a single CustomXMLPart in a CustomXMLParts collection. */
    export class CustomXmlPart {

        /** Get a value that indicates whether the CustomXMLPart is built-in. */
        builtIn: boolean;

        /** Gets the GUID of the CustomXMLPart. */
        id: string;

        /** Gets the set of namespace prefix mappings (CustomXMLPrefixMappings) used against the current CustomXMLPart. */
        namespaceManager: CustomXmlPrefixMappings;

        /** Adds an event handler for a CustomXmlPart object event. */
        addHandlerAsync(eventType: EventType, handler: any, callback: (result: AsyncResult) => void, options?: { asyncContext?: any; });

        /** Asynchronously deletes this custom XML part from the collection. */
        deleteAsync(options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets any CustomXmlNodes in this custom XML part which match the specified XPath. */
        getNodesAsync(xPath: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets the XML inside this custom XML part. */
        getXmlAsync(options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Removes an event handler for a CustomXmlPart object event. */
        removeHandlerAsync(eventType: EventType, options?: { handler?: string; asyncContext?: any; }, callback?: (result: AsyncResult) => void);
    }
}
declare module Office {

    /** Represents a collection of CustomXMLPart objects. */
    export class CustomXmlParts {

        /** Asynchronously adds a new custom XML part to a file. */
        addAsync(xml: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets a custom XML part by its ID. */
        getByIdAsync(id: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets an array of custom XML parts that match the specified namespace. */
        getByNamespaceAsync(ns: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);
    }
}
declare module Office {

    /** Represents a collection of custom namespace prefix mappings. */
    export class CustomXmlPrefixMappings {

        /** Asynchronously adds a prefix to namespace mapping to use when querying an item. */
        addNamespaceAsync(prefix: string, ns: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets the namespace mapped to the specified prefix. */
        getNamespaceAsync(prefix: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Asynchronously gets the prefix for the specified namespace. */
        getPrefixAsync(ns: string, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);
    }
}
declare module Office {

    export class Diagnostics {

        /** Gets a string that represents the name of the host application for the mail app. */
        hostName: string;

        /** Gets a string that represents the version of either the host application or the Exchange Server. */
        hostVersion: string;

        /** Gets a string that represents the current view of Outlook Web App. */
        OWAView: string;
    }
}

declare module Office {

    /** An abstract class that represents the document the app is interacting with. */
    export class Document {
        /** Gets an object that provides access to the bindings defined in the document. */
        bindings: Office.Bindings;
        /** Gets an object that represents the custom XML parts in the document. */
        customXmlParts: Office.CustomXmlParts;
        /** Gets the mode the document is in. */
        mode: Office.DocumentMode;
        /** Gets the URL of the document that the host application currently has open. */
        url: string;
        //** Gets the object that represents the document settings */
        settings: Office.Settings;

        /** Adds an event handler for a Document object event. */
        addHandlerAsync: (eventType: Office.EventType, handler?: any, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
        /** Returns the entire document file in slices of up to 4194304 bytes (4MB). */
        getFileAsync: (fileType: Office.FileType, options?: { sliceSize?: number; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
        /** Reads the data contained in the current selection of the document. */
        getSelectedDataAsync: (coercionType: Office.CoercionType, options?: { valueFormat?: ValueFormat; filterType?: FilterType; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
        /** Removes an event handler for a Document object event. */
        removeHandlerAsync: (eventType: Office.EventType, options?: { handler?: any; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
        /** Writes data to the current selection in the document. */
        setSelectedDataAsync: (data: any, options?: { coercionType?: CoercionType; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
        //** Goto
        goToByIdAsync: (id: string, gotoType: GoToType, options?: { coercionType?: CoercionType; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
    }
}
declare module Office {

    /** Provides the email properties of the sender or specified recipients of an email message or appointment. */
    export class EmailAddressDetails {

        /** Gets the response that an attendee returned for an appointment. */
        appointmentResponse: ResponseType;

        /** Gets the display name associated with an email address. */
        displayName: string;

        /** Gets the SMTP email address. */
        emailAddress: string;

        /** Gets the email address type of a recipient. */
        recipientType: RecipientType ;
    }
}
declare module Office {

    /** Represents an email account on a Exchange Server 2013 server. */
    export class EmailUser {

        /** Gets the name associated with an email account. */
        name: string;

        /** Gets the SMTP email address of the email account. */
        userId: string;
    }
}
declare module Office {

    /** Represents a collection of entities found in an email message or appointment. */
    export class Entities {

        /** Gets the physical addresses (street or mailing addresses) found in an email message or appointment. */
        addresses: string[];

        /** Gets the contacts found in an email address or appointment. */
        contacts: Contact[];

        /** Gets the email addresses found in an email message or appointment. */
        emailAddresses: string[];

        /** Gets the meeting suggestions found in an email message. */
        meetingSuggestions: MeetingSuggestion[];

        /** Gets the phone numbers found in an email message or appointment. */
        phoneNumbers: PhoneNumber[];

        /** Gets the task suggestions found in an email message or appointment. */
        taskSuggestions: TaskSuggestion [];

        /** Gets the Internet URLs present in an email message or appointment. */
        urls: string[];
    }
}
declare module Office {

    /** Provides specific information about an error that occurred during an asynchronous data operation. */
    export class Error {
        /** Gets the numeric code of the error. */
        code: number;
        /** Gets the name of the error. */
        name: string;
        /** Gets a detailed description of the error. */
        message: string;
    }

}
declare module Office {

    /** Represents the document file associated with an app for Office. */
    export class File {

        /** Gets the document file size in bytes. */
        size: number;

        /** Gets the number of slices into which the file is divided. */
        sliceCount: number;

        /** Closes the document file. */
        closeAsync(callback: (result: AsyncResult) => void);

        /** Returns the specified slice. */
        getSliceAsync(sliceIndex: number, callback: (result: AsyncResult) => void);
    }
}
declare module Office {

    /** Provides a base object for all items provided by an application. */
    export class Item {

        /** Gets the date and time that an item was created. */
        dateTimeCreated: Date;

        /** Gets the date and time that an item was last modified. */
        dateTimeModified: Date;

        /** Gets the message class of an item. */
        itemClass: ItemClass;

        /** Gets the item identifier for an item. */
        itemId : string;

        /** Gets the type of item that an instance represents. */
        itemType: MailboxEnums.ItemType;
    }
}
declare module Office {

    /** Provides access to the app for Office object model for Microsoft Outlook 2013 and Microsoft Outlook Web App. */
    export class Mailbox {

        /** Gets an object that provides troubleshooting capabilities for the mail app. */
        diagnostics: Diagnostics;

        /** Gets the URL of the Exchange Web Services (EWS) endpoint for this email account. */
        ewsUrl: Diagnostics;

        /** Gets the message or calendar appointment that shows the app. */
        item: Item;

        /** Gets profile information about the user running the client applicatio */
        userProfile: UserProfile;


        /** Gets a dictionary containing time information in local client time. */
        convertToLocalClientTime(timeValue: Date): any;

        /** Gets a Date object from a dictionary containing time information. */
        convertToUtcClientTime(input: any): Date;

        /** Displays an existing calendar appointment. */
        displayAppointmentForm(itemId: string);

        /** Displays an existing message. */
        displayMessageForm(itemId: string);

        /** Displays a form for creating a new calendar appointment. */
        displayNewAppointmentForm(
            requiredAttendees: EmailAddressDetails[],
            optionalAttendees: EmailAddressDetails[],
            start: Date,
            end: Date,
            location: string,
            resources: string[],
            subject: string,
            body: string,
            customProps: any
            );

        /** Gets a string that contains a token used to get an attachment or item from an Exchange Online server. */
        getCallbackTokenAsync(callback: any, userContext: any);

        /** Gets a token identifying the user and the app for Office. */
        getUserIdentityTokenAsync(callback: any, userContext?: any);

        /** Makes an asynchronous request to an Exchange Web Services (EWS) service on the Exchange server that hosts the user�s mailbox. */
        makeEwsRequestAsync(data: any, callback: any, userContext?: any);
    }
}
declare module Office {

    /** Represents a binding in two dimensions of rows and columns. */
    export class MatrixBinding extends Binding {

        /** Gets the number of columns in the matrix data structure, as an integer value. */
        columnCount: number;

        /** Gets the number of rows in the matrix data structure, as an integer value. */
        rowCount: number;
    }
}
declare module Office {

    /** Represents a request to attend a meeting. */
    export class MeetingRequest {

        /** Gets the date and time that a meeting is to end. */
        end: Date;

        /** Gets the location of the proposed meeting. */
        location: string;

        /** Gets a list of the optional attendees for the meeting. */
        optionalAttendees: EmailAddressDetails[];

        /** Gets the required attendees for the meeting. */
        requiredAttendees: EmailAddressDetails;

        /** Gets a list of the resources required for the meeting. */
        resources: string[];

        /** Gets the date and time that the meeting is to begin. */
        start: Date;
    }
}
declare module Office {

    /** Represents a suggested meeting found in an item. */
    export class MeetingSuggestion {

        /** Gets the attendees for a suggested meeting. */
        addresses: EmailUser[];

        /** Gets the date and time that a suggested meeting is to end. */
        endTime: Date;

        /** Gets the location of a suggested meeting. */
        location: string;

        /** Gets a string that was identified as a meeting suggestion. */
        meetingString: string;

        /** Gets the date and time that a suggested meeting is to begin. */
        startTime: Date;

        /** Gets the subject of a suggested meeting. */
        subject: string;
    }
}
declare module Office {

    /** Represents the selected message. */
    export class Message extends Item {

        /** Gets the carbon-copy (Cc) recipients of a message. */
        cc: EmailAddressDetails;

        /** Gets an identifier for the email conversation that contains a particular message. */
        conversationId: string;

        /** Gets the email address of the sender of a message. */
        from: EmailAddressDetails;

        /** Gets the Internet message identifier for an email message. */
        internetMessageId: string;

        /** Gets the subject of an email message, with all prefixes removed (including �RE:� and �FWD:�). */
        normalizedSubject: string;

        /** Gets the email address of the sender of an email message. */
        sender: EmailAddressDetails;

        /** Gets the complete subject of an email message. */
        subject: string;

        /** Gets the recipients of an email message. */
        to: EmailAddressDetails;

        /** Gets an array of attachments for the message. */
        attachments: AttachmentDetails[];

        /** Gets a collection of entities found in an email message. */
        getEntities(): Entities;

        /** Gets an array of all the entities of the specified entity type found in an email message. */
        getEntitiesByType(entityType: EntityType): Entities[];

        /** Returns well-known entities that pass the named filter defined in the manifest XML file. */
        getFilteredEntitiesByName(name: string): Entities[];

        /** Returns string values in the currently selected message object that match the regular expressions defined in the manifest XML file. */
        getRegExMatches(): Entities[];

        /** Returns string values that match the named regular expression defined in the manifest XML file. */
        getRegExMatchesByName(name: string): Entities[];
    }
}
declare module Office {

    /** Represents an instance of an app, which provides access to the top-level objects of the API. */
    //export class Office {

       /** Gets the Context object that represents the runtime environment of the app and provides access to the top-level objects of the API. */
      export  var  context: Office.Context;

        /** Creates a promise to return a binding based on the selector string passed in. */
       export function select(str: string, onError: () => void);

        /** Toggles on and off the Office alias for the full Office namespace. */
        export function useShortNamespace(useShortcut: boolean);

        /** Occurs when the runtime environment is loaded and the app is ready to start interacting with the application and hosted document. */
        export var initialize: (reason?: Office.InitializationReason) => void;

    //}
}
declare module Office {

    /** Represents a phone number identified in an item. */
    export class PhoneNumber {

        /** Gets the text that was identified in an item as a phone number. */
        originalPhoneString: string;

        /** Gets a text string identified as a phone number. */
        phoneString: string;

        /** Gets the type of a phone number. */
        type: string;
    }
}
declare module Office {

    export class ProjectDocument extends Office.Document {
        /** Asynchronously adds an event handler for the task selection changed event in a ProjectDocument object. */
        addHandlerAsync: (eventType: EventType, options?: { handler?: any; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;

        /** Asynchronously gets the value of the specified field in the active project. */
        getProjectFieldAsync: (fieldId: ProjectProjectFields, callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void;

        /** Asynchronously gets the value of the specified field for the specified resource. */
        getResourceFieldAsync: (resourceId: string, fieldId: ProjectResourceFields, callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void ;

        ///** Asynchronously gets the data that is contained in the current selection of one or more cells in the Gantt chart. */
        getSelectedDataAsync: (coercionType: CoercionType, options?: { valueFormat?: ValueFormat; filterType?: FilterType; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void ;

        /** Asynchronously gets the GUID of the selected resource. */
        getSelectedResourceAsync: (callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void ;

        /** Asynchronously gets the GUID of the selected task. */
        getSelectedTaskAsync: (callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void;

        /** Asynchronously gets the view type and name of the active view. */
        getSelectedViewAsync(callback: (result: AsyncResult) => void, options?: { asyncContext?: any; });

        /** Asynchronously gets the specified task name, the resources that are assigned to the task, and the ID of the task in the synchronized SharePoint task list. */
        getTaskAsync: (taskId: string, callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void;

        /** Asynchronously gets the value of the specified field for the specified task. */
        getTaskFieldAsync: (taskId: string, fieldId: ProjectTaskFields, callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void;

        /** Asynchronously gets the URL of the synchronized SharePoint task list. */
        getWSSUrlAsync: (callback: (result: AsyncResult) => void, options?: { asyncContext?: any; }) => void;

        ///** Asynchronously removes an event handler for the task selection changed event in a ProjectDocument object. */
        removeHandlerAsync: (eventType: EventType, options?: { handler?: any; asyncContext?: any; }, callback?: (result: AsyncResult) => void) => void;
    }
}
declare module Office {

    /** Represents custom settings for a mail app that are stored in the user's mailbox as name/value pairs. */
    export class RoamingSettings {

        /** Retrieves the specified setting. */
        get(name: string): string;

        /** Removes the specified setting. */
        remove(name: string): string;

        /** Saves the settings. */
        saveAsync(callback?: (result: AsyncResult) => void);

        /** Sets or creates the specified setting. */
        set(name: string, value: string);
    }
}
declare module Office {

    /** Represents custom settings for a task pane or content app that are stored in the host document as name/value pairs. */
    export class Settings {

        /** Adds an event handler for the settingsChanged event. */
        addHandlerAsync(eventType: Office.EventType, handler: any, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void): void;

        /** Retrieves the specified setting. */
        get(name: string): any;

        /** Reads all settings persisted in the document and refreshes the content or task pane app's copy of those settings held in memory. */
        refreshAsync(callback?: (result: AsyncResult) => void);

        /** Removes the specified setting. */
        remove(name: string);

        /** Removes an event handler for the settingsChanged event. */
        removeHandlerAsync(eventType: Office.EventType, handler: any, options?: { handler?: string; asyncContext?: any; }, callback?: (result: AsyncResult) => void): void;

        /** Persists the in-memory copy of the settings property bag in the document. */
        saveAsync(callback?: (result: AsyncResult) => void);

        /** Sets or creates the specified setting. */
        set(name: string, value: string);
        }
}
declare module Office {

    /** Represents a slice of a document file. */
    export class Slice {

        /** Gets the index of the file slice. */
        index: number;

        /** Gets the number of slices into which the file is divided. */
        sliceCount: number;

        /** Gets the size of the slice in bytes. */
        size: number;
    }
}
declare module Office {

    /** Represents a binding in two dimensions of rows and columns, optionally with headers. */
    export class TableBinding extends Binding {

        /** Gets the number of columns in the table, as an integer value. */
        columnCount: number;

        /** Gets whether the table has headers. */
        hasHeaders: boolean;

        /** Gets the number of rows in the table, as an integer value. */
        rowCount: number;

        /** Adds rows and values to a table. */
        addRowsAsync(rows: any, options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);

        /** Deletes all non-header rows and their values in the table, shifting appropriately for the host application. */
        deleteAllDataValuesAsync(options?: { asyncContext?: any; }, callback?: (result: AsyncResult) => void);
    }
}
declare module Office {

    /** Represents the data in a TableBinding. */
    export class TableData {

        constructor();
        constructor(rows: any, headers: any);

        /** Gets or sets the headers of the table. */
        headers: any;

        /** Gets or sets the rows in the table. */
        rows: any;
    }
}
declare module Office {

    /** Represents a suggested task identified in an item. */
    export class TaskSuggestion {

        /** Gets the users that should be assigned a suggested task. */
        assignees: EmailUser[];

        /** Gets the text of an item that was identified as a task suggestion. */
        taskString: string;
    }
}
declare module Office {

    /** Represents a bound text selection in the document. */
    export class TextBinding extends Binding {

        
    }
}
declare module Office {

    export class UserProfile {
        /** The user name to use for display. */
        displayName: string;
        /** The user's SMTP email address. */
        emailAdress: string;
        /** The user's local time zone. */
        timeZone: string;
    }
}
declare module Office {
    export enum Table {
        All,
        Data,
        Headers,
    }
}