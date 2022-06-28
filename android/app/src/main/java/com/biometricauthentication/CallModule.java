package com.biometricauthentication;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.SystemClock;
import android.text.Spannable;
import android.text.SpannableString;
import android.text.style.ForegroundColorSpan;
import android.util.Log;

import androidx.annotation.ColorRes;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.google.firebase.messaging.RemoteMessage;

public class CallModule extends ReactContextBaseJavaModule {

    private static final String TAG = "CallModule";
    Context context;

    CallModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "CallModule";
    }

    @ReactMethod
    public void showIncomingCall(String name) {

        Log.e(TAG, "showIncomingCall: "+ name);
//        Intent i = new Intent(context.getApplicationContext(), IncomingCallScreenActivity.class);
//        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
//        i.putExtra("CALLER_NAME", "Yash Patil");
//        i.putExtra("CALL_TYPE","IncomingCall");
//        i.putExtra("APP_STATE",false);
//        context.startActivity(i);

        sendNotification(null);

    }


    public void sendNotification(RemoteMessage remoteMessage) {
        int oneTimeID = (int) SystemClock.uptimeMillis();
        String channelId = "fcm_call_channel";
        String channelName = "Incoming Call";
        Uri uri= Uri.parse("biometricauthentication://");

        Uri notification_sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
//        String notification_title= remoteMessage.getData().get("title");

        Intent intent = new Intent(context, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_ONE_SHOT);

        // notification action buttons start
        PendingIntent acptIntent = MainActivity.getActionIntent(oneTimeID,uri,context);
        PendingIntent rjctIntent = MainActivity.getActionIntent(oneTimeID,uri, context);

        NotificationCompat.Action rejectCall=new NotificationCompat.Action.Builder(R.drawable.rjt_btn,getActionText("Decline",android.R.color.holo_red_light),rjctIntent).build();
        NotificationCompat.Action acceptCall=new NotificationCompat.Action.Builder(R.drawable.acpt_btn,getActionText("Answer",android.R.color.holo_green_light),acptIntent).build();
        //end

        //when device locked show fullscreen notification start
        Intent i = new Intent(context.getApplicationContext(), IncomingCallScreenActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        i.putExtra("APP_STATE",false);
        i.putExtra("FALL_BACK",true);
        i.putExtra("NOTIFICATION_ID",oneTimeID);
        i.putExtra("CALLER_NAME", "Yash Patil");
        i.putExtra("CALL_TYPE","IncomingCall");
        PendingIntent fullScreenIntent = PendingIntent.getActivity(context, 0 /* Request code */, i,
                PendingIntent.FLAG_ONE_SHOT);
        //end

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(context, channelId)
                .setContentTitle("Yash Calling...")
                .setContentText(channelName)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .setAutoCancel(false)
                .setSound(notification_sound)
                .addAction(acceptCall)
                .setTimeoutAfter(20000)
                .addAction(rejectCall)
                .setSmallIcon(R.drawable.acpt_btn)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setDefaults(Notification.DEFAULT_VIBRATE)
                .setFullScreenIntent(fullScreenIntent, true)
                .setSmallIcon(R.mipmap.ic_launcher);


        NotificationManager notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        int importance = NotificationManager.IMPORTANCE_MAX;

        //channel creation start
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            NotificationChannel mChannel = new NotificationChannel(
                    channelId, channelName, importance);
            AudioAttributes attributes = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build();
            mChannel.setSound(notification_sound,attributes);
            mChannel.setDescription(channelName);
            mChannel.enableLights(true);
            mChannel.enableVibration(true);
            notificationManager.createNotificationChannel(mChannel);
        }
        //end

        notificationManager.notify(oneTimeID, notificationBuilder.build());
    }

    private Spannable getActionText(String title, @ColorRes int colorRes) {
        Spannable spannable = new SpannableString(title);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N_MR1) {
            spannable.setSpan(
                    new ForegroundColorSpan(context.getColor(colorRes)), 0, spannable.length(), 0);
        }
        return spannable;
    }





}
