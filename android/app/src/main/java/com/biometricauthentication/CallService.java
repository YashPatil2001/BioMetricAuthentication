package com.biometricauthentication;

import android.app.ActivityManager;
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
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Iterator;
import java.util.List;

import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService;

public class CallService extends FirebaseMessagingService {


    private static final String TAG = "CallService";
    private static DeviceEventManagerModule.RCTDeviceEventEmitter eventEmitter = null;

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        try {
            Log.e(TAG, "onMessageReceived: data : " + remoteMessage.getData());
//            String notifDataType = remoteMessage.getData().get("type");
            String startCallType="incomingcall";
            String disconnectCallType="calldisconnected";
//            if(startCallType.equals(notifDataType)|| disconnectCallType.equals(notifDataType)) {
            Log.e(TAG, "onMessageReceived: isAppRunning : " + isAppRunning());
//                showIncomingCallScreen(remoteMessage,!isAppRunning());

            showIncomingCallScreen(remoteMessage,isAppRunning());
//            sendNotification(remoteMessage);
                return;
//            }
        } catch (Exception e) {
            Log.e(TAG, "onMessageReceived: failure : " + e.getMessage() );
        }
    }


    private void showIncomingCallScreen(RemoteMessage remoteMessage,boolean isAppRunning) {
        String notifDataType = remoteMessage.getData().get("type");
        String startCallType="incomingcall";
        String disconnectCallType="calldisconnected";
//        if( startCallType.equals(notifDataType)) {
            Intent i = new Intent(getApplicationContext(), IncomingCallScreenActivity.class);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            i.putExtra("CALLER_NAME", "Yash Patil");
            i.putExtra("CALL_TYPE","IncomingCall");
            i.putExtra("APP_STATE",    isAppRunning);
            startActivity(i);
//        }else if(disconnectCallType.equals((notifDataType))){
//            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager
//                    .getInstance(FirebaseMessagingService.this);
//            localBroadcastManager.sendBroadcast(new Intent(
//                    "com.incomingcallscreenactivity.action.close"));
//        }
    }

    public void sendNotification(RemoteMessage remoteMessage) {
        int oneTimeID = (int) SystemClock.uptimeMillis();
        String channelId = "fcm_call_channel";
        String channelName = "Incoming Call";
        Uri uri= Uri.parse("biometricauthentication://");

        Uri notification_sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
//        String notification_title= remoteMessage.getData().get("title");

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, intent, PendingIntent.FLAG_ONE_SHOT);

        // notification action buttons start
        PendingIntent acptIntent = MainActivity.getActionIntent(oneTimeID,uri,this);
        PendingIntent rjctIntent = MainActivity.getActionIntent(oneTimeID,uri, this);

        NotificationCompat.Action rejectCall=new NotificationCompat.Action.Builder(R.drawable.rjt_btn,getActionText("Decline",android.R.color.holo_red_light),rjctIntent).build();
        NotificationCompat.Action acceptCall=new NotificationCompat.Action.Builder(R.drawable.acpt_btn,getActionText("Answer",android.R.color.holo_green_light),acptIntent).build();
        //end

        //when device locked show fullscreen notification start
        Intent i = new Intent(getApplicationContext(), IncomingCallScreenActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        i.putExtra("APP_STATE",isAppRunning());
        i.putExtra("FALL_BACK",true);
        i.putExtra("NOTIFICATION_ID",oneTimeID);
        i.putExtra("CALLER_NAME", "Yash Patil");
        i.putExtra("CALL_TYPE","IncomingCall");
        PendingIntent fullScreenIntent = PendingIntent.getActivity(this, 0 /* Request code */, i,
                PendingIntent.FLAG_ONE_SHOT);
        //end

        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, channelId)
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


        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
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
                    new ForegroundColorSpan(this.getColor(colorRes)), 0, spannable.length(), 0);
        }
        return spannable;
    }

    private boolean isAppRunning() {
        ActivityManager m = (ActivityManager) this.getSystemService( ACTIVITY_SERVICE );
        List<ActivityManager.RunningTaskInfo> runningTaskInfoList =  m.getRunningTasks(10);
        Iterator<ActivityManager.RunningTaskInfo> itr = runningTaskInfoList.iterator();
        int n=0;
        while(itr.hasNext()){
            n++;
            itr.next();
        }
        if(n==1){ // App is killed
            return false;
        }
        return true; // App is in background or foreground
    }


}
