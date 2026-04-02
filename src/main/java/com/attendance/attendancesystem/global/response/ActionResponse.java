package com.attendance.attendancesystem.global.response;

public class ActionResponse {

    private final int status;
    private final boolean success;
    private final String message;
    private final String redirectUrl;

    public ActionResponse(int status, boolean success, String message, String redirectUrl) {
        this.status = status;
        this.success = success;
        this.message = message;
        this.redirectUrl = redirectUrl;
    }

    public static ActionResponse success(String message, String redirectUrl) {
        return new ActionResponse(200, true, message, redirectUrl);
    }

    public int getStatus() {
        return status;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getRedirectUrl() {
        return redirectUrl;
    }
}