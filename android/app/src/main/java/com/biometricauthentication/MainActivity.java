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

import androidx.annotation.ColorRes;
import androidx.core.app.NotificationCompat;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.google.firebase.messaging.RemoteMessage;

public class MainActivity extends ReactActivity {

  public static final String NOTIFICATION_ID = "NOTIFICATION_ID";

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "BioMetricAuthentication";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. There the RootView is created and
   * you can specify the rendered you wish to use (Fabric or the older renderer).
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }


    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }
  }

  private  void sendNotification() {
    int oneTimeID = (int) SystemClock.uptimeMillis();
    String channelId = "fcm_call_channel";
    String channelName = "Incoming Call";
    Uri uri= Uri.parse("viauapp://");

    Uri notification_sound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
//    String notification_title= remoteMessage.getData().get("title");
    String notification_title = "Yash Calling...";

    Intent intent = new Intent(MainActivity.this, MainActivity.class);
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
    i.putExtra("APP_STATE",false);
    i.putExtra("FALL_BACK",true);
    i.putExtra("NOTIFICATION_ID",oneTimeID);
    i.putExtra("CALLER_NAME", "Yash Patil");
    i.putExtra("CALL_TYPE","IncomingCall");
    PendingIntent fullScreenIntent = PendingIntent.getActivity(this, 0 /* Request code */, i,
            PendingIntent.FLAG_ONE_SHOT);
    //end

    NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, channelId)
            .setContentTitle(notification_title)
            .setContentText(channelName)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setAutoCancel(true)
            .setSound(notification_sound)
            .addAction(acceptCall)
            .addAction(rejectCall)
            .setContentIntent(pendingIntent)
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

  public static PendingIntent getActionIntent(int notificationId, Uri uri, Context context) {
    Intent intent =  new Intent(Intent.ACTION_VIEW,uri);
    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    intent.putExtra(NOTIFICATION_ID, notificationId);
    PendingIntent acceptIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);
    return acceptIntent;
  }
}
